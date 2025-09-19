import { cn } from "@/lib/utils";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 shadow-sm", className)} {...props} />;
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className="mb-4" {...props} />;
}
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className="text-xl font-bold" {...props} />;
}
export function CardDescription(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className="text-sm text-slate-500 dark:text-slate-400" {...props} />;
}
