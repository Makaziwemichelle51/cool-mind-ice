import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, ShoppingCart, Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { products, formatMoney, BUSINESS } from "@/lib/products";
import { useCart, useSettings, logActivity } from "@/lib/store";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Ice Products & Prices — Cool Cubes" },
      {
        name: "description",
        content:
          "Buy small, medium and large ice bags, bulk ice and event ice packages from Cool Cubes with delivery or collection.",
      },
      { property: "og:title", content: "Ice Products & Prices — Cool Cubes" },
      {
        property: "og:description",
        content: "Fresh, crystal-clear ice for homes, events and businesses.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { setValue: setCart } = useCart();
  const { value: settings } = useSettings();
  const [bulk, setBulk] = useState({ name: "", contact: "", details: "" });

  const addToCart = (id: string, name: string, price: number) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === id);
      return found
        ? prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
        : [...prev, { id, name, price, qty: 1 }];
    });
    logActivity("Cart", `Added ${name} to cart`);
    toast.success(`${name} added to cart`);
  };

  const whatsappLink = (text: string) =>
    `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <AppShell>
      <PageHeader
        title="Ice Products"
        description="Fresh, filtered, crystal-clear ice — delivered or collected."
        action={
          <Button asChild variant="outline">
            <Link to="/orders">
              <ShoppingCart className="size-4" /> View cart
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden pt-0 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={800}
              height={800}
              className="aspect-square w-full object-cover"
            />
            <CardContent className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <Badge
                  variant={product.inStock ? "secondary" : "outline"}
                  className={product.inStock ? "bg-accent text-accent-foreground" : ""}
                >
                  {product.stockNote}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-muted-foreground">{product.weight}</span>
                <span className="text-xl font-semibold">{formatMoney(product.price)}</span>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                className="flex-1"
                onClick={() => addToCart(product.id, product.name, product.price)}
              >
                <ShoppingCart className="size-4" /> Add to Cart
              </Button>
              <Button asChild variant="outline" size="icon" aria-label="Order on WhatsApp">
                <a
                  href={whatsappLink(`Hi ${BUSINESS.name}, I'd like to order: ${product.name} (${product.weight}).`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardContent className="space-y-4 pt-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Truck className="size-5" aria-hidden /> Bulk order request
            </h2>
            <p className="text-sm text-muted-foreground">
              Restaurants, venues and event planners — tell us what you need and we'll
              quote you within one business day.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bulk-name">Name / business</Label>
                <Input
                  id="bulk-name"
                  value={bulk.name}
                  onChange={(e) => setBulk({ ...bulk, name: e.target.value })}
                  placeholder="Ocean Grill Restaurant"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bulk-contact">Contact number</Label>
                <Input
                  id="bulk-contact"
                  value={bulk.contact}
                  onChange={(e) => setBulk({ ...bulk, contact: e.target.value })}
                  placeholder="082 000 0000"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bulk-details">What do you need?</Label>
              <Textarea
                id="bulk-details"
                rows={3}
                value={bulk.details}
                onChange={(e) => setBulk({ ...bulk, details: e.target.value })}
                placeholder="200kg of cubed ice every Friday, delivered before 10:00."
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!bulk.details.trim()) {
                  toast.error("Please describe your bulk requirement.");
                  return;
                }
                logActivity("Bulk", "Bulk order request sent");
                window.open(
                  whatsappLink(
                    `Bulk order request from ${bulk.name || "a customer"} (${bulk.contact || "no number"}): ${bulk.details}`,
                  ),
                  "_blank",
                );
              }}
            >
              Send bulk request via WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="space-y-3 pt-6">
            <h2 className="text-lg font-semibold">Delivery &amp; collection</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Same-day delivery for orders placed before 16:00.</li>
              <li>• Free delivery on orders over {formatMoney(500)}.</li>
              <li>• Collection available daily from 07:00 to 18:00.</li>
              <li>• Insulated packaging keeps ice solid for up to 6 hours.</li>
            </ul>
            <Button asChild variant="outline" className="w-full">
              <a href={whatsappLink(`Hi ${BUSINESS.name}, I have a question about delivery.`)} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
