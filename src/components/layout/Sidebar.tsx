"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/layout/SidebarDock";
import { FileSpreadsheet, Users, Wrench, Smile, ChevronRight } from "lucide-react";

type Item = {
  href: string;
  label: string;
  icon?: React.ReactNode;
  children?: Item[];
};

const items: Item[] = [
  { href: "/sales", label: "매출시트", icon: <FileSpreadsheet className="h-4 w-4" /> },
  {
    href: "/teachers",
    label: "강사",
    icon: <Users className="h-4 w-4" />,
    children: [{ href: "/teachers", label: "강사·기수 관리" }],
  },
  {
    href: "/utilities",
    label: "유틸리티",
    icon: <Wrench className="h-4 w-4" />,
    children: [{ href: "/utilities/emoji", label: "이모지 모음", icon: <Smile className="h-3.5 w-3.5" /> }],
  },
];

export default function Sidebar() {
  const { collapsed } = useSidebar();
  const pathname = usePathname();

  const autoOpen = useMemo(
    () =>
      items
        .filter((it) => it.children?.length && (pathname === it.href || pathname.startsWith(it.href + "/")))
        .map((it) => it.href),
    [pathname]
  );
  const [open, setOpen] = useState<string[]>(autoOpen);
  useEffect(() => setOpen(autoOpen), [autoOpen]);

  const showText = !collapsed;

  const linkBase = "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors";
  const linkIdle = "text-muted-foreground hover:bg-muted/60 hover:text-foreground";
  const linkActive = "bg-muted text-foreground font-semibold";

  return (
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-3.5rem-2.5rem)] w-full">
        <div className={cn("px-4 py-3 text-[11px] uppercase tracking-wide text-muted-foreground", !showText && "px-2")}>
          {showText ? "메뉴" : " "}
        </div>

        <nav className={cn("px-2 pb-4 space-y-1.5", !showText && "px-1")}>
          {items.map((it) =>
            it.children?.length ? (
              <Accordion
                key={it.href}
                type="multiple"
                value={open}
                onValueChange={setOpen}
                className="w-full"
              >
                <AccordionItem value={it.href} className="border-none">
                  <AccordionTrigger
                    className={cn(
                      "px-2.5 py-2 rounded-md text-sm hover:no-underline [&>svg]:hidden",
                      pathname === it.href || pathname.startsWith(it.href + "/")
                        ? linkActive
                        : "hover:bg-muted/60"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {it.icon ?? <span className="h-4 w-4 rounded bg-muted-foreground/30" />}
                      {showText && <span className="truncate">{it.label}</span>}
                    </span>
                    {showText && (
                      <ChevronRight
                        className={cn(
                          "ml-auto h-3.5 w-3.5 transition-transform",
                          open.includes(it.href) && "rotate-90"
                        )}
                      />
                    )}
                  </AccordionTrigger>

                  {showText && (
                    <AccordionContent className="pt-1 pl-2">
                      <ul className="space-y-1">
                        {it.children.map((ch) => {
                          const active = pathname === ch.href || pathname.startsWith(ch.href + "/");
                          return (
                            <li key={ch.href}>
                              <Link
                                href={ch.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(linkBase, active ? linkActive : linkIdle)}
                              >
                                {ch.icon && <span>{ch.icon}</span>}
                                <span className="truncate">{ch.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  )}
                </AccordionItem>
              </Accordion>
            ) : (
              <Link
                key={it.href}
                href={it.href}
                aria-current={pathname === it.href ? "page" : undefined}
                className={cn(linkBase, pathname === it.href ? linkActive : linkIdle, !showText && "justify-center")}
                title={!showText ? it.label : undefined}
              >
                {it.icon ?? <span className="h-4 w-4 rounded bg-muted-foreground/30" />}
                {showText && <span className="truncate">{it.label}</span>}
              </Link>
            )
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
