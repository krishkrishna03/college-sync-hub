import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Clock, Target, BookOpen, Brain, Calculator, MessageSquare, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PracticeTest {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  description: string;
  icon: any;
  color: string;
  attempts: number;
  bestScore?: number;
}

const practiceTests: PracticeTest[] = [
  {
    id: "p1",
    title: "Basic Arithmetic Practice",
    subject: "Arithmetic",
    difficulty: "Easy",
    duration: 30,
    totalQuestions: 25,
    description: "Practice basic arithmetic operations and number theory",
    icon: Calculator,
    color: "bg-blue-500",
    attempts: 3,
    bestScore: 85
  },
  {
    id: "p2",
    title: "Logical Reasoning Practice",
    subject: "Reasoning",
    difficulty: "Medium",
    duration: 45,
    totalQuestions: 30,
    description: "Enhance your logical thinking and pattern recognition",
    icon: Brain,
    color: "bg-purple-500",
    attempts: 2,
    bestScore: 78
  },
  {
    id: "p3",
    title: "Verbal Ability Practice",
    subject: "Verbal",
    difficulty: "Easy",
    duration: 40,
    totalQuestions: 35,
    description: "Improve vocabulary, grammar, and reading comprehension",
    icon: MessageSquare,
    color: "bg-green-500",
    attempts: 1,
    bestScore: 92
  },
  {
    id: "p4",
    title: "Programming Concepts",
    subject: "Technical",
    difficulty: "Medium",
    duration: 60,
    totalQuestions: 40,
    description: "Test your programming knowledge and problem-solving skills",
    icon: Code,
    color: "bg-orange-500",
    attempts: 0
  },
  {
    id: "p5",
    title: "Advanced Reasoning",
    subject: "Reasoning",
    difficulty: "Hard",
    duration: 75,
    totalQuestions: 50,
    description: "Challenge yourself with complex logical problems",
    icon: Target,
    color: "bg-red-500",
    attempts: 0
  },
  {
    id: "p6",
    title: "Data Structures Basics",
    subject: "Technical",
    difficulty: "Easy",
    duration: 50,
    totalQuestions: 30,
    description: "Learn fundamental data structures and algorithms",
    icon: BookOpen,
    color: "bg-indigo-500",
    attempts: 1,
    bestScore: 88
  }
];

export default function PracticeTests() {
  const navigate = useNavigate();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const filteredTests = practiceTests.filter(test => {
    const matchesSubject = subjectFilter === "all" || test.subject === subjectFilter;
    const matchesDifficulty = difficultyFilter === "all" || test.difficulty === difficultyFilter;
    return matchesSubject && matchesDifficulty;
  });

  const handleStartPractice = (testId: string) => {
    navigate(`/take-test/${testId}?mode=practice`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Practice Tests</h1>
        <p className="text-muted-foreground">Improve your skills with unlimited practice tests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="Arithmetic">Arithmetic</SelectItem>
            <SelectItem value="Reasoning">Reasoning</SelectItem>
            <SelectItem value="Verbal">Verbal</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Practice Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => {
          const IconComponent = test.icon;
          return (
            <Card key={test.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${test.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <Badge className={getDifficultyColor(test.difficulty)}>
                    {test.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{test.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{test.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">{test.duration} min</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium">{test.totalQuestions} questions</span>
                  </div>
                </div>

                {test.attempts > 0 && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Best Score:</span>
                      <span className="font-bold text-primary">{test.bestScore}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Attempts:</span>
                      <span className="font-medium">{test.attempts}</span>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
                  onClick={() => handleStartPractice(test.id)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Practice Tests Found</h3>
          <p className="text-muted-foreground">No practice tests match your current filters.</p>
        </div>
      )}
    </div>
  );
}