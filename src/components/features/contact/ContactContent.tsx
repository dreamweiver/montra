import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Bug, MessageSquare } from "lucide-react";

// =============================================================================
// ContactContent Component
// =============================================================================
// Shared content for contact page, used by both public /contact and
// authenticated /dashboard/contact routes.
// =============================================================================
export default function ContactContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">
          Montra is an open-source personal finance app built to help you track your money smarter.
        </p>
      </div>

      {/* Creator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            About the Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Montra is created and maintained by <span className="font-semibold text-foreground">Dreamweiver</span>.
          </p>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/dreamweiver"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              Visit GitHub Profile
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Source Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Source Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Montra is open source. Check out the code, star the repo, or contribute.
          </p>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/dreamweiver/montra"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              View Repository
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Issues & Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Issues & Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Found a bug? Have a feature request or feedback? We&apos;d love to hear from you.
            Please open an issue on GitHub — it helps us improve Montra for everyone.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a
                href="https://github.com/dreamweiver/montra/issues/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Bug className="mr-2 h-4 w-4" />
                Report a Bug
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/dreamweiver/montra/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                View All Issues
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
