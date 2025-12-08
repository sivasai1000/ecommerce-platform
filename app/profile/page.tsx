"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    if (!user) return null;

    return (
        <div className="container py-10 px-4 md:px-6 max-w-2xl">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src="/avatars/01.png" />
                        <AvatarFallback className="text-lg">{user.name[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-2xl">{user.name}</CardTitle>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <h3 className="font-semibold text-lg">Account Details</h3>
                        <div className="grid grid-cols-3 text-sm">
                            <span className="text-muted-foreground">User ID</span>
                            <span className="col-span-2">{user.id}</span>
                        </div>
                        <div className="grid grid-cols-3 text-sm">
                            <span className="text-muted-foreground">Email</span>
                            <span className="col-span-2">{user.email}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg mb-4">Settings</h3>
                        <Button variant="destructive" onClick={logout} className="w-full sm:w-auto">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
