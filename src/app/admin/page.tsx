"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import axios from "axios";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import { AdminSidebar } from "@/components/ui/admin-siderbar";
import { ProtectedRoute } from "@/components/protected-route";
import { getUrl } from "../../lib/get-url";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Student {
  _id: string;
  trainingType: { _id: string; name: string };
  location: { _id: string; name: string };
  ages: string;
  gender?: "male" | "female";
  createdAt: string;
  paymentStatus: "paid" | "unpaid" | "pending";
  firstName: string;
  lastName: string;
}
interface RawStudent {
  _id: string;
  trainingType: {
    _id: string;
    name: string;
    studentNumber: number;
    amount: number;
  };
  location: { _id: string; name: string };
  ages: string;
  gender?: "male" | "female";
  createdAt: string;
  paymentStatus: "paid" | "unpaid" | "pending";
  firstNames: string[];
  lastNames: string[];
}

interface EnrollmentStats {
  byProvince: { name: string; count: number }[];
  byGender: { name: string; count: number }[];
  byAge: { name: string; count: number }[];
  byTrainingType: { name: string; count: number }[];
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<EnrollmentStats>({
    byProvince: [],
    byGender: [],
    byAge: [],
    byTrainingType: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("statistics");

  const flattenStudents = (data: RawStudent[]): Student[] => {
    const result: Student[] = [];
    data.forEach((item) => {
      const firstNames = item.firstNames || [];
      const lastNames = item.lastNames || [];
      const maxLen = Math.max(firstNames.length, lastNames.length);

      for (let i = 0; i < maxLen; i++) {
        result.push({
          _id: `${item._id}-${i}`,
          trainingType: item.trainingType,
          location: item.location,
          ages: item.ages,
          gender: item.gender,
          createdAt: item.createdAt,
          paymentStatus: item.paymentStatus,
          firstName: firstNames[i] || "",
          lastName: lastNames[i] || "",
        });
      }
    });
    return result;
  };
  console.log("test", students);

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${getUrl()}/register`);
      if (response.status === 200 && response.data.registrations) {
        const flatStudents: Student[] = flattenStudents(
          response.data.registrations as RawStudent[]
        );
        setStudents(flatStudents);
        setFilteredStudents(flatStudents);
        const byProvince = countBy(
          flatStudents,
          (s) => s.location?.name || "Тодорхойгүй"
        );
        const byGender = countBy(
          flatStudents,
          (s) => s.gender || "Тодорхойгүй"
        );
        const byAge = countBy(flatStudents, (s) => s.ages || "Тодорхойгүй");
        const byTrainingType = countBy(
          flatStudents,
          (s) => s.trainingType?.name || "Тодорхойгүй"
        );
        setStats({ byProvince, byGender, byAge, byTrainingType });
      }
    } catch (error) {
      console.error("Алдаа:", error);
      setError("Өгөгдөл татахад алдаа гарлаа. Админтай холбоо барина уу.");
      setStudents([]);
      setFilteredStudents([]);
      setStats({ byProvince: [], byGender: [], byAge: [], byTrainingType: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const countBy = (
    arr: Student[],
    keyGetter: (item: Student) => string
  ): { name: string; count: number }[] => {
    const map: Record<string, number> = {};
    arr.forEach((item) => {
      const key = keyGetter(item);
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  };
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-gray-100 w-full">
        <div>
          <AdminSidebar />
        </div>
        <div className="flex-1 p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-blue-500">Enjoy AI</h1>
              <p className="text-xl mt-1 text-blue-500">
                Элсэлтийн тоон мэдээлэл
              </p>
            </div>

            {/* Statistics tab */}
            <TabsContent value="statistics" className="space-y-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-4">
                      {error}
                    </div>
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle>Нийт элсэлтийн тойм</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatBox
                          label="Нийт элсэгчдийн тоо"
                          value={filteredStudents.length}
                        />
                        <StatBox
                          label="Байршилаар"
                          value={stats.byProvince.length}
                        />
                        <StatBox
                          label="Сургалтын төрлөөр"
                          value={stats.byTrainingType.length}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ChartCard
                      title="Аймаг бүрээр"
                      data={stats.byProvince}
                      color="#0088FE"
                    />
                    <ChartCard
                      title="Насны ангилал"
                      data={stats.byAge}
                      color="#00C49F"
                    />
                    <ChartCard
                      title="Сургалтын төрөл"
                      data={stats.byTrainingType}
                      color="#FF8042"
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ChartCard({
  title,
  data,
  color,
}: {
  title: string;
  data: { name: string; count: number }[];
  color: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[...data].sort((a, b) => b.count - a.count)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Элсэгчдийн тоо" fill={color} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
