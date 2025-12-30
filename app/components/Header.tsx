"use client";
import React from "react";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome, IconMessage, IconWorldQuestion } from "@tabler/icons-react";
import { useAuthStore } from "@/store/auth";
import slugify from "@/utils/slugify";

export default function Header() {
    const { user, hydrated } = useAuthStore();
    const [navItems, setNavItems] = React.useState([
        {
            name: "Home",
            link: "/",
            icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Questions",
            link: "/questions",
            icon: <IconWorldQuestion className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
    ]);

    React.useEffect(() => {
        if (!hydrated) return;

        const items = [
            {
                name: "Home",
                link: "/",
                icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
            },
            {
                name: "Questions",
                link: "/questions",
                icon: <IconWorldQuestion className="h-4 w-4 text-neutral-500 dark:text-white" />,
            },
        ];

        if (user) {
            items.push({
                name: "Profile",
                link: `/users/${user.$id}/${slugify(user.name)}`,
                icon: <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />,
            });
        } 

        if(!user){
            items.push({
                name : "Login",
                link : "/login",
                icon : <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />
            })
        } else{
            items.push({
                name : "Logout",
                link : "/logout",
                icon : <IconMessage className="h-4 w-4 text-neutral-500 dark:text-white" />
            })
        }

        setNavItems(items);
    }, [user, hydrated]);

    return (
        <div className="relative w-full">
            <FloatingNav navItems={navItems} />
        </div>
    );
}
