import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";
import SiteFooter from "../components/home/SiteFooter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sizeCategories = [
  {
    category: "rings",
    sizingSystem: "us ring sizes",
    sizes: "1 / 2 / 3 / 4 / 5 / 6 / 7",
    dimensions: "depends on creators themselves",
    notes: "offerings may also include half-step increments. creators decide which sizes their design supports.",
  },
  {
    category: "bracelets",
    sizingSystem: "apparel-style",
    sizes: "xs / s / m / l / xl / xxl",
    dimensions: "depends on creators themselves",
    notes: "chain bracelets may offer adjustable lengths. cuff styles may be rigid and size-specific.",
  },
  {
    category: "brooches",
    sizingSystem: "standard",
    sizes: "free size / s / m / l",
    dimensions: "depends on creators themselves",
    notes: "most brooches are one-size. larger statement pieces may come in size variants.",
  },
  {
    category: "pendants",
    sizingSystem: "standard",
    sizes: "free size / s / m / l",
    dimensions: "depends on creators themselves",
    notes: "chain length is usually adjustable or chosen separately. pendant body size is what varies.",
  },
  {
    category: "earrings",
    sizingSystem: "standard",
    sizes: "free size / s / m / l",
    dimensions: "depends on creators themselves",
    notes: "stud and drop sizes vary by design. hoop diameters may be offered in small, medium, or large.",
  },
  {
    category: "necklaces",
    sizingSystem: "standard",
    sizes: "free size / s / m / l",
    dimensions: "depends on creators themselves",
    notes: "chain length and pendant scale are independent. check each listing for what is adjustable.",
  },
  {
    category: "cufflinks",
    sizingSystem: "standard",
    sizes: "free size",
    dimensions: "depends on creators themselves",
    notes: "typically one-size. the mechanism is standard; the face design varies.",
  },
  {
    category: "charms",
    sizingSystem: "standard",
    sizes: "free size / s / m / l",
    dimensions: "depends on creators themselves",
    notes: "individual charm size may vary. bracelets or necklaces that hold charms are separate.",
  },
];

export default function SizeGuide() {
  return (
    <div>
      <div className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 tracking-wide transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            back
          </Link>

          <div className="mb-8">
            <h1 className="font-serif text-2xl md:text-4xl font-light tracking-tight lowercase text-foreground mb-2">
              size guide
            </h1>
            <p className="text-sm text-muted-foreground tracking-wide font-light">
              sizing varies by artifact type and is set by each creator
            </p>
          </div>

          <div className="bg-card rounded-[20px] border border-border/50 shadow-paper overflow-hidden mb-10">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60">
                  <TableHead className="text-xs tracking-wider font-mono uppercase text-muted-foreground/70 py-4 px-5">
                    artifact type
                  </TableHead>
                  <TableHead className="text-xs tracking-wider font-mono uppercase text-muted-foreground/70 py-4 px-5">
                    sizing system
                  </TableHead>
                  <TableHead className="text-xs tracking-wider font-mono uppercase text-muted-foreground/70 py-4 px-5">
                    sizes available
                  </TableHead>
                  <TableHead className="text-xs tracking-wider font-mono uppercase text-muted-foreground/70 py-4 px-5">
                    dimensions
                  </TableHead>
                  <TableHead className="text-xs tracking-wider font-mono uppercase text-muted-foreground/70 py-4 px-5">
                    notes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sizeCategories.map((row) => (
                  <TableRow
                    key={row.category}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-sm text-foreground font-light tracking-wide py-4 px-5 capitalize">
                      {row.category}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-light tracking-wide py-4 px-5 capitalize">
                      {row.sizingSystem}
                    </TableCell>
                    <TableCell className="text-sm text-foreground font-light tracking-wide py-4 px-5">
                      {row.sizes}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-light tracking-wide py-4 px-5 italic">
                      {row.dimensions}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed py-4 px-5 max-w-xs">
                      {row.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-6">
              <h2 className="font-serif text-lg font-light tracking-tight lowercase text-foreground mb-3">
                how to find your ring size
              </h2>
              <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed">
                the most reliable method is to visit a local jeweler and ask for your us ring size. if that is not an option, you can measure the inner diameter of a ring that already fits and match it to a us size chart online. keep in mind that finger size can vary throughout the day and with temperature, so measure at room temperature when your hands are relaxed.
              </p>
            </div>

            <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-6">
              <h2 className="font-serif text-lg font-light tracking-tight lowercase text-foreground mb-3">
                how to find your bracelet size
              </h2>
              <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed">
                wrap a flexible measuring tape around your wrist where you would normally wear a bracelet. if you do not have a measuring tape, use a strip of paper, mark where it overlaps, then measure the length with a ruler. add about half an inch to one inch to that measurement for a comfortable fit, depending on whether you prefer a snug or loose style.
              </p>
            </div>

            <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-6">
              <h2 className="font-serif text-lg font-light tracking-tight lowercase text-foreground mb-3">
                free size pieces
              </h2>
              <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed">
                some designs, such as pendants, earrings, and brooches, are offered in a single size because they do not need to conform to a specific body measurement. the exact dimensions for these pieces are determined by the creator and will be noted on the individual artifact page. if you need a specific scale, you can message the creator before ordering.
              </p>
            </div>

            <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-6">
              <h2 className="font-serif text-lg font-light tracking-tight lowercase text-foreground mb-3">
                what if my size is not listed?
              </h2>
              <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed">
                creators choose which sizes they want to offer for each design. if you need a size that is not listed, reach out to the creator directly. many creators are open to custom sizing for an additional fee. you can also commission a fully bespoke piece through their profile if commissions are enabled.
              </p>
            </div>

            <div className="bg-card rounded-[20px] border border-border/50 shadow-paper px-7 py-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-light tracking-tight lowercase text-foreground mb-3">
                    for creators
                  </h2>
                  <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed mb-3">
                    a full sizing and creation guide is coming soon. it will cover everything our pilot-affiliated manufacturers currently support - from ring sizing and wall thickness tolerances to surface detailing, sprue placement, and castable geometry limits - as well as the capabilities we plan to add in future program phases.
                  </p>
                  <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed mb-3">
                    the documentation will be open to all creators and include base templates, printable-ready checklists, material-specific tips, common pitfalls, and design ideas to help you get the most out of the lost-wax casting pipeline.
                  </p>
                  <p className="text-sm text-muted-foreground font-light tracking-wide leading-relaxed mb-4">
                    if you have questions about a specific design before the guide goes live, reach out and we will review your model manually.
                  </p>
                  <Link
                    to="/creator-docs"
                    className="inline-flex items-center gap-2 text-xs tracking-wider text-foreground border border-border/60 px-4 py-2 rounded-full hover:bg-secondary transition-colors"
                  >
                    preview the creator docs outline
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
