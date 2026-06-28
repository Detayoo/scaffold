import { Suspense } from "react";
import { LoadingState } from "@/components/LoadingState";

export function withSuspense(Component: React.ComponentType) {
  function Wrapped(props: any) {
    return (
      <Suspense fallback={<LoadingState />}>
        <Component {...props} />
      </Suspense>
    );
  }
  Wrapped.displayName = `withSuspense(${Component.displayName || Component.name})`;
  return Wrapped;
}
