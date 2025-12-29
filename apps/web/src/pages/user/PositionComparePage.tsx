import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X, Plus, MapPin, GraduationCap, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompareStore } from "@/stores/compareStore";

interface CompareField {
  key: string;
  label: string;
  render?: (value: any) => React.ReactNode;
}

const compareFields: CompareField[] = [
  { key: "departmentName", label: "招录机关" },
  { key: "positionName", label: "职位名称" },
  {
    key: "workLocation",
    label: "工作地点",
    render: (value) => (
      <span className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        {value || "-"}
      </span>
    ),
  },
  { key: "recruitCount", label: "招录人数" },
  {
    key: "education",
    label: "学历要求",
    render: (value) => (
      <span className="flex items-center gap-1">
        <GraduationCap className="h-3 w-3" />
        {value || "不限"}
      </span>
    ),
  },
  { key: "major", label: "专业要求" },
  { key: "politicalStatus", label: "政治面貌" },
  {
    key: "workExpYears",
    label: "工作经验",
    render: (value) => (
      <span className="flex items-center gap-1">
        <Briefcase className="h-3 w-3" />
        {value ? `${value}年以上` : "不限"}
      </span>
    ),
  },
  { key: "age", label: "年龄要求" },
  { key: "hukou", label: "户籍要求" },
  { key: "gender", label: "性别要求" },
  {
    key: "competitionRatio",
    label: "竞争比",
    render: (value) => (
      <span className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {value ? `${value}:1` : "暂无数据"}
      </span>
    ),
  },
  { key: "examType", label: "考试类型" },
  { key: "registrationTime", label: "报名时间" },
];

const mockPositions = [
  {
    id: "1",
    departmentName: "国家税务总局北京市税务局",
    positionName: "一级行政执法员",
    workLocation: "北京市朝阳区",
    recruitCount: 2,
    education: "本科及以上",
    major: "财政学类、金融学类、经济学类",
    politicalStatus: "中共党员",
    workExpYears: 2,
    age: "18-35周岁",
    hukou: "不限",
    gender: "不限",
    competitionRatio: 156,
    examType: "国考",
    registrationTime: "2024-10-15 至 2024-10-24",
  },
  {
    id: "2",
    departmentName: "海关总署广州海关",
    positionName: "海关监管",
    workLocation: "广东省广州市",
    recruitCount: 3,
    education: "本科及以上",
    major: "法学类、公共管理类",
    politicalStatus: "不限",
    workExpYears: 0,
    age: "18-35周岁",
    hukou: "不限",
    gender: "男性",
    competitionRatio: 89,
    examType: "国考",
    registrationTime: "2024-10-15 至 2024-10-24",
  },
];

export default function PositionComparePage() {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompareStore();

  const compareIds = compareList.map((p) => p.id);
  const positions = mockPositions.filter((p) => compareIds.includes(Number(p.id)));

  const displayPositions = positions.length > 0 ? positions : mockPositions.slice(0, 2);

  const getFieldValue = (position: any, field: CompareField) => {
    const value = position[field.key];
    if (field.render) {
      return field.render(value);
    }
    return value || "-";
  };

  const handleRemove = (id: string) => {
    removeFromCompare(Number(id));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">职位对比</h1>
          <Badge variant="secondary">{displayPositions.length} 个职位</Badge>
        </div>
        <div className="flex items-center gap-2">
          {displayPositions.length < 4 && (
            <Button variant="outline" onClick={() => navigate("/positions")}>
              <Plus className="h-4 w-4 mr-2" />
              添加职位
            </Button>
          )}
          <Button variant="ghost" onClick={clearCompare}>
            清空对比
          </Button>
        </div>
      </div>

      {displayPositions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground mb-4">暂无对比职位</p>
            <Button onClick={() => navigate("/positions")}>去添加职位</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>基本信息对比</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px] sticky left-0 bg-background">
                        对比项
                      </TableHead>
                      {displayPositions.map((position) => (
                        <TableHead key={position.id} className="min-w-[200px]">
                          <div className="flex items-center justify-between">
                            <span className="truncate">{position.positionName}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-2"
                              onClick={() => handleRemove(position.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {compareFields.map((field) => (
                      <TableRow key={field.key}>
                        <TableCell className="font-medium sticky left-0 bg-background">
                          {field.label}
                        </TableCell>
                        {displayPositions.map((position) => (
                          <TableCell key={position.id}>{getFieldValue(position, field)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>竞争分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayPositions.map((position) => (
                  <div key={position.id} className="p-4 border rounded-lg space-y-3">
                    <h3 className="font-medium truncate">{position.positionName}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">招录人数</span>
                        <span className="font-medium">{position.recruitCount}人</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">竞争比</span>
                        <span className="font-medium text-orange-600">
                          {position.competitionRatio}:1
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">预估报名</span>
                        <span className="font-medium">
                          {position.competitionRatio * position.recruitCount}人
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="text-xs text-muted-foreground mb-1">竞争激烈程度</div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            position.competitionRatio > 100
                              ? "bg-red-500"
                              : position.competitionRatio > 50
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(position.competitionRatio / 2, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayPositions.map((position) => {
                  const ratio = position.competitionRatio;
                  let suggestion = "";
                  let color = "";

                  if (ratio > 100) {
                    suggestion = "竞争非常激烈，建议慎重考虑或做好充分准备";
                    color = "text-red-600";
                  } else if (ratio > 50) {
                    suggestion = "竞争较为激烈，需要认真备考";
                    color = "text-orange-600";
                  } else {
                    suggestion = "竞争相对温和，值得考虑";
                    color = "text-green-600";
                  }

                  return (
                    <div
                      key={position.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{position.positionName}</p>
                        <p className={`text-sm ${color}`}>{suggestion}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
