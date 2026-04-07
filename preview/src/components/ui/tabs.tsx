import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const listRef = React.useRef<HTMLDivElement>(null);
  const [pill, setPill] = React.useState<{ left: number; width: number } | null>(null);

  const updatePill = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector('[data-state="active"]') as HTMLElement | null;
    if (!active) return;
    setPill({ left: active.offsetLeft, width: active.offsetWidth });
  }, []);

  // useLayoutEffect so the pill is positioned before first paint (no flash)
  React.useLayoutEffect(() => {
    updatePill();
    const list = listRef.current;
    if (!list) return;
    // rAF defers measurement until after layout is complete, preventing stutter
    const observer = new MutationObserver(() => requestAnimationFrame(updatePill));
    observer.observe(list, { subtree: true, attributeFilter: ["data-state"] });
    return () => observer.disconnect();
  }, [updatePill]);

  return (
    <TabsPrimitive.List
      ref={(node) => {
        (listRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn(
        "relative inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {pill && (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 rounded-md bg-primary shadow"
          style={{
            left: pill.left,
            width: pill.width,
            transition: `left var(--motion-duration-moderate) var(--motion-curve-navigation),
                         width var(--motion-duration-moderate) var(--motion-curve-navigation)`,
          }}
        />
      )}
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-primary-foreground cursor-pointer",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
