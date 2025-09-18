import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Code, Brain, Cloud, Shield, Database, ArrowLeft, Users, Star, Calendar, ExternalLink, Link, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: any;
  learners: number;
  rating: number;
  level: string;
  registrationDeadline: string;
  hasEnrollmentForm: boolean;
  formLink?: string;
  attachedLinks?: string[];
}

export default function AvailableCourses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAttachLink, setShowAttachLink] = useState(false);
  const [newLink, setNewLink] = useState("");

  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      title: "Complete Data Analytics Program",
      category: "Data Science",
      description: "Master data analysis, visualization, and machine learning techniques",
      icon: Database,
      learners: 1250,
      rating: 4.6,
      level: "Beginner to Advance",
      registrationDeadline: "2024-03-15",
      hasEnrollmentForm: true,
      formLink: "https://forms.google.com/data-analytics",
      attachedLinks: []
    },
    {
      id: "2",
      title: "Machine Learning Fundamentals",
      category: "Data Science",
      description: "Learn ML algorithms and implementation",
      icon: Brain,
      learners: 892,
      rating: 4.8,
      level: "Intermediate to Advance",
      registrationDeadline: "2024-03-20",
      hasEnrollmentForm: false,
      attachedLinks: []
    },
    {
      id: "3",
      title: "Full Stack Web Development",
      category: "Web Development",
      description: "Build modern web applications with latest technologies",
      icon: Code,
      learners: 1100,
      rating: 4.5,
      level: "Beginner to Advance",
      registrationDeadline: "2024-03-18",
      hasEnrollmentForm: true,
      formLink: "https://forms.google.com/fullstack-web",
      attachedLinks: []
    },
    {
      id: "4",
      title: "React & Node.js Bootcamp",
      category: "Web Development",
      description: "Master React frontend and Node.js backend",
      icon: Code,
      learners: 680,
      rating: 4.9,
      level: "Intermediate to Advance",
      registrationDeadline: "2024-03-22",
      hasEnrollmentForm: true,
      formLink: "https://forms.google.com/react-node",
      attachedLinks: []
    },
    {
      id: "5",
      title: "iOS App Development",
      category: "Mobile Development",
      description: "Create mobile applications for iOS platforms",
      icon: BookOpen,
      learners: 450,
      rating: 4.7,
      level: "Beginner to Advance",
      registrationDeadline: "2024-03-25",
      hasEnrollmentForm: false,
      attachedLinks: []
    },
    {
      id: "6",
      title: "AWS Cloud Solutions",
      category: "Cloud Computing",
      description: "Learn cloud platforms and infrastructure management",
      icon: Cloud,
      learners: 320,
      rating: 4.4,
      level: "Intermediate to Advance",
      registrationDeadline: "2024-03-28",
      hasEnrollmentForm: true,
      formLink: "https://forms.google.com/aws-cloud",
      attachedLinks: []
    },
    {
      id: "7",
      title: "Ethical Hacking & Security",
      category: "Cybersecurity",
      description: "Protect systems and networks from digital attacks",
      icon: Shield,
      learners: 275,
      rating: 4.6,
      level: "Intermediate to Advance",
      registrationDeadline: "2024-03-30",
      hasEnrollmentForm: false,
      attachedLinks: []
    },
    {
      id: "8",
      title: "Deep Learning with Python",
      category: "AI & ML",
      description: "Advanced AI and deep learning techniques",
      icon: Brain,
      learners: 380,
      rating: 4.8,
      level: "Advance",
      registrationDeadline: "2024-04-02",
      hasEnrollmentForm: true,
      formLink: "https://forms.google.com/deep-learning",
      attachedLinks: []
    }
  ]);

  const categories = ["All", "Data Science", "Web Development", "Mobile Development", "AI & ML", "Cybersecurity", "Cloud Computing"];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = activeCategory === "all" || activeCategory === "All" || course.category === activeCategory;
    const matchesLevel = levelFilter === "all" || course.level.toLowerCase().includes(levelFilter.toLowerCase());
    return matchesCategory && matchesLevel;
  });

  const handleAttachLink = () => {
    if (!newLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid link",
        variant: "destructive"
      });
      return;
    }

    if (selectedCourse) {
      setCourses(prev => prev.map(course => 
        course.id === selectedCourse.id 
          ? { ...course, attachedLinks: [...(course.attachedLinks || []), newLink] }
          : course
      ));
      
      toast({
        title: "Success",
        description: "Link attached successfully"
      });
      
      setNewLink("");
      setShowAttachLink(false);
      setSelectedCourse(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/courses')}
          className="bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold text-foreground">Available Courses</h1>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-white shadow-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="data-science">Data Science</SelectItem>
              <SelectItem value="web-development">Web Development</SelectItem>
              <SelectItem value="mobile-development">Mobile Development</SelectItem>
              <SelectItem value="ai-ml">AI & ML</SelectItem>
              <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
              <SelectItem value="cloud-computing">Cloud Computing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-48 bg-white shadow-sm">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advance">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category || (activeCategory === "all" && category === "All") ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === category || (activeCategory === "all" && category === "All")
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const IconComponent = course.icon;
          return (
            <Card key={course.id} className="bg-white shadow-md hover:shadow-xl transition-all duration-300 border-0 rounded-xl overflow-hidden relative">
              {/* Category Badge */}
              <Badge className="absolute top-4 right-4 bg-purple-100 text-purple-700 px-3 py-1 text-xs font-medium rounded-full z-10">
                {course.category}
              </Badge>

              <CardHeader className="pb-4 relative">
                {/* Course Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                {/* Course Title */}
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {course.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Rating Section */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.learners}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                {/* Course Subtitle */}
                <h4 className="font-bold text-gray-900">{course.title}</h4>

                {/* Level Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>Level: {course.level}</span>
                </div>

                {/* Registration Deadline */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Registration Deadline: {course.registrationDeadline}</span>
                </div>

                {/* Buttons */}
                <div className="space-y-3 pt-2">
                  {course.hasEnrollmentForm && course.formLink ? (
                    <Button 
                      variant="outline" 
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                      onClick={() => window.open(course.formLink, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Create Enrollment Form
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-300 text-gray-500"
                      disabled
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Registration Completed
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowAttachLink(true);
                    }}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Attach Link
                  </Button>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                    onClick={() => navigate(`/course-overview/${course.id}`)}
                  >
                    Explore Course
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attach Link Dialog */}
      <Dialog open={showAttachLink} onOpenChange={setShowAttachLink}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attach Google Form Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-input">Google Form Link</Label>
              <Input
                id="link-input"
                placeholder="Paste your Google Form link here..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
            </div>
            
            {selectedCourse && selectedCourse.attachedLinks && selectedCourse.attachedLinks.length > 0 && (
              <div>
                <Label>Existing Links:</Label>
                <div className="space-y-2 mt-2">
                  {selectedCourse.attachedLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm truncate flex-1">{link}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCourses(prev => prev.map(course => 
                            course.id === selectedCourse.id 
                              ? { ...course, attachedLinks: course.attachedLinks?.filter((_, i) => i !== index) }
                              : course
                          ));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowAttachLink(false);
                setNewLink("");
                setSelectedCourse(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleAttachLink}>
                Attach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-gray-600">No courses match your current filters.</p>
        </div>
      )}
    </div>
  );
}