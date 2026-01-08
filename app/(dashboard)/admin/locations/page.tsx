import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getLocationsSummary } from "@/lib/db/queries/locations";

export default async function LocationsPage() {
  const user = await getCurrentUser();

  if (user?.role !== "admin") {
    redirect("/");
  }

  const locations = await getLocationsSummary();

  return (
    <div className="space-y-4 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/more">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Locations</h1>
          <p className="text-sm text-muted-foreground">
            Store zones, chambers & shelves
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{locations.summary.zones}</p>
            <p className="text-xs text-muted-foreground">Zones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{locations.summary.chambers}</p>
            <p className="text-xs text-muted-foreground">Chambers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold">{locations.summary.shelves}</p>
            <p className="text-xs text-muted-foreground">Shelves</p>
          </CardContent>
        </Card>
      </div>

      {/* Zones */}
      <div className="space-y-4">
        {locations.zones.map((zone) => (
          <Card key={zone.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {zone.code}
                </Badge>
                {zone.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {zone.chambers.map((chamber) => (
                  <div
                    key={chamber.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{chamber.name}</span>
                      <span className="text-sm text-muted-foreground">
                        (C{String(chamber.chamberNumber).padStart(2, "0")})
                      </span>
                    </div>
                    <Badge variant="secondary">
                      {chamber.shelfCount} shelves
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Location Code Reference */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Location Code Format</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            Location codes follow this format:
          </p>
          <div className="font-mono text-sm bg-background p-2 rounded">
            <span className="text-blue-500">[Zone]</span>-
            <span className="text-green-500">C[Chamber]</span>-
            <span className="text-orange-500">S[Shelf]</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Example: <strong>R-C01-S02</strong> = Right Zone, Top Chamber, Shelf
            2
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
