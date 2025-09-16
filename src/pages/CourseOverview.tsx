import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Clock, Users, Star, BookOpen, CheckCircle } from "lucide-react";

export default function CourseOverview() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock course data - in real app, fetch based on ID
  const course = {
    id: "1",
    title: "Complete Data Analytics Program",
    category: "Data Science",
    duration: "6 months",
    level: "Beginner to Advance",
    rating: 4.6,
    enrolledStudents: 1250,
    enrollmentLink: "https://forms.google.com/enrollment/data-analytics",
    overview: {
      whyChoose: [
        "Industry-relevant curriculum designed by experts",
        "Hands-on projects with real-world datasets",
        "Career support and placement assistance",
        "Flexible learning schedule",
        "Certificate from recognized institution"
      ],
      benefits: [
        "Master data analysis tools and techniques",
        "Learn Python, R, SQL, and advanced analytics",
        "Build a portfolio of data science projects",
        "Network with industry professionals",
        "Career transition support"
      ],
      keyHighlights: [
        "Live interactive sessions with industry experts",
        "24/7 doubt resolution support",
        "Capstone project with real company data",
        "Job placement assistance",
        "Lifetime access to course materials"
      ],
      assignments: [
        {
          title: "Data Cleaning and Preprocessing",
          description: "Clean and prepare raw datasets for analysis",
          duration: "Week 1-2"
        },
        {
          title: "Exploratory Data Analysis",
          description: "Perform comprehensive EDA on business datasets",
          duration: "Week 3-4"
        },
        {
          title: "Statistical Analysis Project",
          description: "Apply statistical methods to solve business problems",
          duration: "Week 5-8"
        },
        {
          title: "Machine Learning Implementation",
          description: "Build and deploy ML models for predictive analytics",
          duration: "Week 9-16"
        },
        {
          title: "Capstone Project",
          description: "End-to-end data science project with real industry data",
          duration: "Week 17-24"
        }
      ]
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/available-courses')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Overview</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.enrolledStudents} enrolled
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {course.rating}
                    </div>
                  </div>
                </div>
                <Button onClick={() => window.open("https://docs.google.com/spreadsheets/d/responses", '_blank')}>
                  <Users className="w-4 h-4 mr-2" />
                  Enrolled Students
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Why You Should Choose This Course */}
          <Card>
            <CardHeader>
              <CardTitle>Why You Should Choose This Course</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.overview.whyChoose.map((reason, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Course Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Course Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.overview.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Highlights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.overview.keyHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Level</h4>
                <p className="text-sm text-muted-foreground">{course.level}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">Duration</h4>
                <p className="text-sm text-muted-foreground">{course.duration}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold">Category</h4>
                <Badge variant="secondary">{course.category}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Course Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.overview.assignments.map((assignment, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-sm">{assignment.title}</h5>
                        <p className="text-xs text-muted-foreground mt-1">
                          {assignment.description}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {assignment.duration}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}