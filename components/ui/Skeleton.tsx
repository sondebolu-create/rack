import { View } from 'react-native';

/** A pulsing grey block shown while a list loads. Hidden from screen readers (the list announces itself when ready). */
export function Skeleton({ className = '' }: { className?: string }) {
  return <View accessible={false} importantForAccessibility="no-hide-descendants" aria-hidden className={`animate-pulse rounded-md bg-strong ${className}`} />;
}

/** Card-shaped placeholder that matches ProductCard. */
export function ProductCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <View className={`gap-1.5 rounded-md border border-line bg-card p-2 ${className}`}>
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-20" />
    </View>
  );
}
