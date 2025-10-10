"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import * as XLSX from "xlsx";
import { AdminSidebar } from "../../components/ui/admin-siderbar";
import axios from "axios";
import { getUrl } from "../../lib/get-url";
import { useRouter } from "next/navigation";

interface Student {
  _id: string;
  trainingType: {
    _id: string;
    name: string;
    studentNumber: number;
    amount: number;
    ageLimitMin: number;
    ageLimitMax: number;
  };
  location: {
    _id: string;
    name: string;
  };
  schoolName: string;
  teamName: string;
  lastNames: string[];
  firstNames: string[];
  teacherName: string;
  ages: string;
  contactPhone: string;
  paidAt: string | null;
  expireAt: string | null;
  paymentStatus: "paid" | "unpaid" | "pending";
  paymentAmount: number;
  createdAt: string;
  updatedAt: string;
  invoiceId?: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const router = useRouter();

  const getData = async () => {
    try {
      const response = await axios.get(`${getUrl()}/register`);
      const fetchedStudents = response.data.registrations;
      setStudents(fetchedStudents);
      setFilteredStudents(fetchedStudents);
    } catch (error) {
      console.error("Алдаа гарлаа:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const provinces = Array.from(
    new Set(students.map((student) => student.location?.name))
  ).sort();

  useEffect(() => {
    let result = students;

    if (searchTerm) {
      result = result.filter(
        (student) =>
          student.firstNames
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.lastNames
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.contactPhone.includes(searchTerm)
      );
    }

    if (selectedProvince !== "all") {
      result = result.filter(
        (student) => student.location?.name === selectedProvince
      );
    }

    setFilteredStudents(result);
  }, [searchTerm, selectedProvince, students]);

  useEffect(() => {
    const total = filteredStudents
      .filter((student) => student.paymentStatus === "paid")
      .reduce((sum, student) => sum + (student.paymentAmount || 0), 0);
    setTotalPaidAmount(total);
  }, [filteredStudents]);

  const exportStudentsToExcel = () => {
    const excelData = filteredStudents
      .map((student) => {
        const numChildren = Math.max(
          student.firstNames.length,
          student.lastNames.length
        );
        const paymentPerChild =
          student.paymentStatus === "paid" && student.paymentAmount
            ? student.paymentAmount / numChildren
            : 0;

        const rows = [];
        for (let i = 0; i < numChildren; i++) {
          rows.push({
            Овог: student.lastNames[i] || "",
            Нэр: student.firstNames[i] || "",
            Сургууль: i === 0 ? student.schoolName : "",
            "Багшийн нэр": i === 0 ? student.teacherName : "",
            Баг: i === 0 ? student.teamName : "",
            "Тэмцээн төрөл": i === 0 ? student.trainingType?.name : "",
            Нас: i === 0 ? student.ages : "",
            Утас: i === 0 ? student.contactPhone : "",
            Байршил: i === 0 ? student.location?.name : "",
            Төлбөр: i === 0 ? student.paymentStatus : "",
            Дүн: paymentPerChild,
            Огноо:
              i === 0 ? new Date(student.createdAt).toLocaleDateString() : "",
          });
        }
        return rows;
      })
      .flat();

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Оюутнууд");
    XLSX.writeFile(workbook, "Оюутнуудын_мэдээлэл.xlsx");
  };

  return (
    <div>
      <div className="space-y-4 mt-4 md:ml-64 px-8 pt-10">
        <div className="p-4 border rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Төлбөрийн мэдээлэл</h2>
              <p className="mt-2 text-gray-600">
                Бүртгэлтэй сурагчдын жагсаалт
              </p>
            </div>
            <Button className="bg-green-400" onClick={exportStudentsToExcel}>
              Excel татах
            </Button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-4">
            <Input
              placeholder="Хайх (Овог, Нэр, Утас)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4 sm:mb-0"
            />
            <Select
              value={selectedProvince}
              onValueChange={setSelectedProvince}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Аймаг сонгох" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Байршилаар харах</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№</TableHead>
                  <TableHead>Нэр</TableHead>
                  <TableHead>Сургууль</TableHead>
                  <TableHead>Багшийн нэр</TableHead>
                  <TableHead>Баг нэр</TableHead>
                  <TableHead>Тэмцээн төрөл</TableHead>
                  <TableHead>Нас</TableHead>
                  <TableHead>Утас</TableHead>
                  <TableHead>Байршил</TableHead>
                  <TableHead>Төлбөр</TableHead>
                  <TableHead>Дүн</TableHead>
                  <TableHead>Огноо</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => {
                  const numChildren = Math.max(
                    student.firstNames.length,
                    student.lastNames.length
                  );
                  const paymentPerChild =
                    student.paymentStatus === "paid" && student.paymentAmount
                      ? student.paymentAmount / numChildren
                      : 0;

                  return student.firstNames.map((childName, i) => (
                    <TableRow
                      key={`${student._id}-${i}`}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        router.push(`/admin/students/${student._id}`)
                      }
                    >
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>{index + 1}</TableCell>
                      )}
                      <TableCell>
                        {student.lastNames[i]
                          ? `${student.lastNames[i][0]}. ${
                              student.firstNames[i] || ""
                            }`
                          : student.firstNames[i] || ""}
                      </TableCell>
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {student.schoolName}
                        </TableCell>
                      )}
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {student.teacherName}
                        </TableCell>
                      )}
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {student.teamName}
                        </TableCell>
                      )}
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {student.trainingType.name}
                        </TableCell>
                      )}
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {student.ages}
                        </TableCell>
                      )}
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {student.contactPhone}
                        </TableCell>
                      )}
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {student.location?.name}
                        </TableCell>
                      )}
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {student.paymentStatus === "paid" && (
                            <span className="inline-block bg-green-400 text-white text-sm font-medium px-3 py-1 rounded-full">
                              Төлсөн
                            </span>
                          )}
                          {student.paymentStatus === "unpaid" && (
                            <span className="inline-block bg-red-400 text-white text-sm font-medium px-3 py-1 rounded-full">
                              Төлөөгүй
                            </span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {paymentPerChild.toLocaleString()} ₮
                      </TableCell>
                      {i === 0 && (
                        <TableCell rowSpan={numChildren}>
                          {new Date(student.createdAt).toLocaleDateString()}
                        </TableCell>
                      )}
                    </TableRow>
                  ));
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end mt-3">
            <p className="font-semibold">
              Нийт дүн: {totalPaidAmount.toLocaleString()} ₮
            </p>
          </div>
        </div>
      </div>
      <AdminSidebar />
    </div>
  );
};

export default Students;
