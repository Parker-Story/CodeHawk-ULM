"use client";

import { useState } from "react";
import { LayoutDashboard, Calendar, User, Archive, FlaskConical, ClipboardList } from "lucide-react";
const ICON_MAP = { LayoutDashboard, Calendar, User, Archive, FlaskConical, ClipboardList };
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { PORTAL_CONFIG } from "@/lib/portals";

function sidebarItemsWithIcons(items) {
    return items.map((item) => ({
        ...item,
        icon: item.icon ? ICON_MAP[item.icon] : undefined,
    }));
}

export default function PortalLayout({ variant, children, Provider }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const config = PORTAL_CONFIG[variant] ?? PORTAL_CONFIG.student;
    const items = sidebarItemsWithIcons(config.sidebarItems ?? []);

    const content = (
        <div className="min-h-screen bg-zinc-800">
            <Navbar variant={variant} onMenuClick={() => setSidebarOpen((o) => !o)} />
            <Sidebar
                isOpen={sidebarOpen}
                items={items}
                activeClassName={config.activeClassName}
                ariaLabel={config.ariaLabel}
                showSignOut
            />
            <main
                className={`pt-16 transition-[margin] duration-300 ${
                    sidebarOpen ? "lg:ml-64" : ""
                }`}
            >
                {children}
            </main>
        </div>
    );

    if (Provider) {
        return <Provider>{content}</Provider>;
    }
    return content;
}