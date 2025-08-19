import { supabase } from "../../utils/supabase.ts";

export const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Credit amounts based on product types from checkout metadata
export const getCreditsForProductType = (productType: string): number => {
    switch (productType) {
        case 'pro_subscription':
            return 50; // Monthly credits for pro plan
        case 'additional_credits':
            return 50; // One-time additional credits
        default:
            return 0;
    }
};

// Helper function to get user ID from Stripe customer
export async function getUserIdFromCustomer(stripe: any, customerId: string): Promise<string | null> {
    try {
        const customer = await stripe.customers.retrieve(customerId);
        return customer.metadata?.supabase_uid || null;
    } catch (error) {
        console.error('Error retrieving customer:', error);
        return null;
    }
}

export const createErrorResponse = (message: string, status = 400) => {
    return new Response(
        JSON.stringify({ error: message }),
        {
            headers: { "Content-Type": "application/json" },
            status
        }
    );
};

export const createSuccessResponse = (data: unknown = {}) => {
    return new Response(
        JSON.stringify(data),
        {
            headers: { "Content-Type": "application/json" },
            status: 200
        }
    );
};

// Helper: idempotency guard based on Stripe object ID recorded in credit_transactions.stripe_session_id
export async function hasProcessedStripeId(stripeId?: string | null) {
    if (!stripeId) return false;
    const { data, error } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('stripe_session_id', stripeId)
        .limit(1);

    if (error) {
        console.error('Error checking existing stripe_session_id:', error);
        return false;
    }

    return !!(data && data.length > 0);
}

// Helper function to get user by email
export async function getUserByEmail(email: string) {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', email)
        .limit(1);

    if (error) {
        console.error('Error fetching user by email:', error);
        return null;
    }

    return profiles?.[0] || null;
}

// Helper function to create user profile if not exists
export async function createUserProfile(email: string, name?: string) {
    // First create auth user (this might need to be handled differently depending on your auth setup)
    // For now, we'll assume the user exists in auth.users but not in profiles

    const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
            email,
            full_name: name || null,
        })
        .select('id, email, full_name')
        .single();

    if (error) {
        console.error('Error creating user profile:', error);
        return null;
    }

    return profile;
}

// Helper function to add credits to user account
export async function addCreditsToUser(userId: string, amount: number, description: string, stripeSessionId?: string) {
    const { data, error } = await supabase.rpc('update_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: 'purchase',
        p_description: description,
        p_stripe_session_id: stripeSessionId
    });

    if (error) {
        console.error('Error updating user credits:', error);
        return false;
    }

    return data;
}

export async function addAdditionalCreditsToUser(userId: string, amount: number, description: string, stripeSessionId?: string) {
    const { data, error } = await supabase.rpc('update_user_additional_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_transaction_type: 'purchase',
        p_description: description,
        p_stripe_session_id: stripeSessionId
    });

    if (error) {
        console.error('Error updating user additional credits:', error);
        return false;
    }

    return data;
}

// Helper function to revoke access (set credits to 0 for subscription cancellation)
export async function revokeUserAccess(userId: string, description: string) {
    const creditsResult = await addCreditsToUser(userId, 0, description);

    if (!creditsResult) {
        console.error('Error revoking user access:', creditsResult);
        return false;
    }
    
    const additionalCreditsResult = await addAdditionalCreditsToUser(userId, 0, description);

    if (!additionalCreditsResult) {
        console.error('Error revoking user access:', additionalCreditsResult);
        return false;
    }

    return true;
}