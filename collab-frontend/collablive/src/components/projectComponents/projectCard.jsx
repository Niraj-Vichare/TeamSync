import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ProjectCard({ project }) {
  return (
    <Card className="hover:shadow-lg transition cursor-pointer">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">{project.title}</CardTitle>
        <Badge className='text-white' variant={project.status === "Completed" ? "success" : "destructive"}>
          {project.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-500">
        <p>{project.description}</p>
        <div className="text-xs">
          {project.startDate} – {project.endDate}
        </div>
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-green-500 rounded"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">{project.progress}% complete</div>
      </CardContent>
    </Card>
  )
}
