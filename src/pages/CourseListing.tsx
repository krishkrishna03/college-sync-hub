import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Star, BookOpen, Calendar, ExternalLink, ArrowLeft } from "lucide-react";

interface Course {
  id: string;
  title: string;
  category: string;
  interestedUsers: number;
  rating: number;
  level: string;
  lastRegistrationDate: string;
  registrationStatus: "open" | "completed";
  formLink?: string;
}

export default function CourseListing() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [courseType, setCourseType] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Get category name from categoryId
  const getCategoryName = (id: string) => {
    const categoryMap: { [key: string]: string } = {
      "data-science": "Data Science",
      "web-development": "Web Development",
      "ai-ml": "AI & ML",
      "cloud-computing": "Cloud Computing",
      "cybersecurity": "Cybersecurity",
      "mobile-development": "Mobile Development"
    };
    return categoryMap[id] || "Course Category";
  };

  const courses: Course[] = [
    {
      id: "1",
      title: "Complete Data Analytics Program",
      category: "Data Science",
      interestedUsers: 1250,
      rating: 4.6,
      level: "Beginner to Advance",
      lastRegistrationDate: "2024-03-15",
      registrationStatus: "open",
      formLink: "https://forms.google.com/data-analytics"
    },
    {
      id: "2",
      title: "Machine Learning Fundamentals",
      category: "Data Science",
      interestedUsers: 892,
      rating: 4.8,
      level: "Intermediate to Advance",
      lastRegistrationDate: "2024-03-20",
      registrationStatus: "completed"
    },
    {
      id: "3",
      title: "Python for Data Science",
      category: "Data Science",
      interestedUsers: 756,
      rating: 4.7,
      level: "Beginner to Intermediate",
      lastRegistrationDate: "2024-03-25",
      registrationStatus: "open",
      formLink: "https://forms.google.com/python-data-science"
    },
    {
      id: "4",
      title: "Full Stack Web Development",
      category: "Web Development",
      interestedUsers: 1100,
      rating: 4.5,
      level: "Beginner to Advance",
      lastRegistrationDate: "2024-03-18",
      registrationStatus: "open",
      formLink: "https://forms.google.com/fullstack-web"
    },
    {
      id: "5",
      title: "React & Node.js Bootcamp",
      category: "Web Development",
      interestedUsers: 680,
      rating: 4.9,
      level: "Intermediate to Advance",
      lastRegistrationDate: "2024-03-22",
      registrationStatus: "open",
      formLink: "https://forms.google.com/react-node"
    }
  ];

  const categories = ["All", "Popular", "New", "Featured"];

  // Filter courses based on current category
  const categoryName = getCategoryName(categoryId || "");
  const filteredCourses = courses.filter(course => {
    const matchesCategory = course.category === categoryName;
    if (activeTab !== "all") {
      // Add tab-based filtering logic here
      return matchesCategory;
    }
    if (courseType !== "all" && course.category.toLowerCase() !== courseType.toLowerCase()) return false;
    return matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/available-courses')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{categoryName} Courses</h1>
          <p className="text-muted-foreground">Explore all courses in {categoryName}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={courseType} onValueChange={setCourseType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Course Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="beginner">Beginner Level</SelectItem>
            <SelectItem value="intermediate">Intermediate Level</SelectItem>
            <SelectItem value="advanced">Advanced Level</SelectItem>
          </SelectContent>
        </Select>

        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="price-free">Free</SelectItem>
            <SelectItem value="price-paid">Paid</SelectItem>
            <SelectItem value="duration-short">Short Duration</SelectItem>
            <SelectItem value="duration-long">Long Duration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div className="overflow-x-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground min-w-full">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category.toLowerCase()}
                className="whitespace-nowrap px-3 py-1.5 text-sm font-medium"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Course Banner */}
            <div className="h-48 bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center relative">
              <div className="text-center text-primary-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{course.title}</h3>
              </div>
              {course.registrationStatus === "completed" && (
                <Badge className="absolute top-2 right-2" variant="secondary">
                  Registration Completed
                </Badge>
              )}
            </div>

            <CardContent className="p-6">
              {/* Course Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{course.interestedUsers} interested users</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating} rating</span>
                </div>

                <h4 className="font-semibold text-foreground">{course.title}</h4>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>Level: {course.level}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Last date: {course.lastRegistrationDate}</span>
                </div>

                {/* Registration Section */}
                {course.registrationStatus === "open" && course.formLink ? (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Registration Form</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(course.formLink, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Register Now
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Registration Status</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full" 
                      disabled
                    >
                      Registration Completed
                    </Button>
                  </div>
                )}

                <Button 
                  className="w-full mt-4 bg-success hover:bg-success/90 text-success-foreground" 
                  onClick={() => navigate(`/course-overview/${course.id}`)}
                >
                  Explore
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">No courses available in this category yet.</p>
        </div>
      )}
    </div>
  );
}