'use client';

import { Card, CardContent } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon?: React.ReactNode;
}

export default function StatsCard({ title, value, change, icon }: StatsCardProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-xl font-semibold">{value}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}