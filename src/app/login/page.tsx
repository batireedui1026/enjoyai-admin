"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = userData.username;
    const password = userData.password;
    await login({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-400">
            Enjoy Ai
          </h1>
          <p className="text-muted-foreground text-sm">
            Системд нэвтрэхийн тулд мэдээллээ оруулна уу
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacher-email">Нэвтрэх нэр</Label>
            <Input
              id="teacher-email"
              type="email"
              placeholder="Нэвтрэх нэр оруулна уу"
              className="w-full"
              value={userData.username}
              onChange={(e) =>
                setUserData({ ...userData, username: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-password">Нууц үг</Label>
            <div className="relative">
              <Input
                id="teacher-password"
                type={showPassword ? "text" : "password"}
                placeholder="Нууц үг оруулна уу"
                value={userData.password}
                className="w-full pr-10"
                onChange={(e) =>
                  setUserData({ ...userData, password: e.target.value })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember-teacher" />
            <Label htmlFor="remember-teacher" className="text-sm font-normal">
              Намайг сана
            </Label>
          </div>

          <Button
            className="w-full mt-6 bg-blue-600"
            size="lg"
            onClick={onSubmit}
          >
            Нэвтрэх
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
