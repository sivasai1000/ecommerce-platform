"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { LogOut, Upload, User as UserIcon, MapPin, Calendar, Edit2, Save, X, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
    const { user, logout, updateUser, isAuthenticated, token, isLoading } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        bio: "",
        gender: "",
        dateOfBirth: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: ""
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (isLoading) return; // Wait for auth check

        if (!isAuthenticated) {
            router.push("/login");
        } else if (user) {
            // Initialize form data from user object
            const address = typeof user.address === 'string' ? JSON.parse(user.address) : user.address || {};

            setFormData({
                name: user.name || "",
                mobile: user.mobile || "",
                bio: user.bio || "",
                gender: user.gender || "",
                dateOfBirth: user.dateOfBirth || "",
                street: address.street || "",
                city: address.city || "",
                state: address.state || "",
                zip: address.zip || "",
                country: address.country || ""
            });
            setPreviewImage(user.profilePicture || null);
        }
    }, [isAuthenticated, router, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("mobile", formData.mobile);
            data.append("bio", formData.bio);
            data.append("gender", formData.gender);
            data.append("dateOfBirth", formData.dateOfBirth);

            // Construct address object
            const addressObj = {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                country: formData.country
            };
            data.append("address", JSON.stringify(addressObj));

            if (profileImage) {
                data.append("image", profileImage);
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: data
            });

            if (!res.ok) {
                throw new Error("Failed to update profile");
            }

            const responseData = await res.json();
            updateUser(responseData.user);
            setIsEditing(false);
            toast.success("Profile updated successfully!");

        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="container py-10 px-4 md:px-6 max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                {/* Left Column: User Card */}
                <Card className="h-fit">
                    <CardHeader className="text-center">
                        <div className="relative mx-auto mb-4">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                                <AvatarImage src={previewImage || user.profilePicture || ""} className="object-cover" />
                                <AvatarFallback className="text-4xl">{user.name[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <CardTitle className="text-2xl">{user.name}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-1 mt-1">
                            <Mail className="w-3 h-3" /> {user.email}
                        </CardDescription>
                        {user.mobile && (
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                <Phone className="w-3 h-3" /> {user.mobile}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-sm text-muted-foreground italic">
                            {user.bio || "No bio added yet."}
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t pt-6">
                        <Button variant="destructive" onClick={logout} className="w-full">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </CardFooter>
                </Card>

                {/* Right Column: Details or Edit Form */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>{isEditing ? "Edit Profile Details" : "Personal Information"}</CardTitle>
                        <CardDescription>
                            {isEditing ? "Update your personal information and address." : "View your account details."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Basic Info</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mobile">Mobile Number</Label>
                                            <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="+91..." />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender</Label>
                                            <Select value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                                            <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} placeholder="Tell us a bit about yourself..." />
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="text-lg font-medium">Address</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="street">Street Address</Label>
                                        <Input id="street" name="street" value={formData.street} onChange={handleInputChange} placeholder="123 Main St" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" name="city" value={formData.city} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input id="state" name="state" value={formData.state} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zip">Zip Code</Label>
                                            <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Input id="country" name="country" value={formData.country} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Full Name</Label>
                                        <p className="font-medium">{user.name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Email</Label>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Mobile</Label>
                                        <p className="font-medium">{user.mobile || "Not set"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Gender</Label>
                                        <p className="font-medium capitalize">{user.gender || "Not set"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Date of Birth</Label>
                                        <p className="font-medium">{user.dateOfBirth || "Not set"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-muted-foreground">Member Since</Label>
                                        <p className="font-medium">{new Date().getFullYear()}</p>
                                        {/* Ideally created_at should be in user object */}
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="font-medium mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Address
                                    </h3>
                                    {user.address && Object.keys(user.address).length > 0 ? (
                                        <address className="not-italic text-sm text-muted-foreground">
                                            {typeof user.address === 'string' ? JSON.parse(user.address).street : user.address.street}<br />
                                            {typeof user.address === 'string' ? JSON.parse(user.address).city : user.address.city}, {typeof user.address === 'string' ? JSON.parse(user.address).state : user.address.state} {typeof user.address === 'string' ? JSON.parse(user.address).zip : user.address.zip}<br />
                                            {typeof user.address === 'string' ? JSON.parse(user.address).country : user.address.country}
                                        </address>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No address information saved.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                    {isEditing && (
                        <CardFooter className="flex justify-end gap-2 border-t pt-6">
                            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" form="profile-form" disabled={loading}>
                                {loading && <span className="animate-spin mr-2">⏳</span>}
                                Save Changes
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </div>
    );
}
