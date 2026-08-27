import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Trash2, CheckCircle2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/products";
import { useCart, useOrders, useSettings, logActivity, type Order } from "@/lib/store";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Cart & Checkout — Cool Cubes Ice Orders" },
      {
        name: "description",
        content:
          "Review your ice cube cart, choose delivery or collection and confirm your Cool Cubes order in seconds.",
      },
      { property: "og:title", content: "Cart & Checkout — Cool Cubes" },
      {
        property: "og:description",
        content: "Fast checkout for ice bags, bulk ice and event packages.",
      },
    ],
  }),
  component: OrdersPage,
});

const DELIVERY_FEE = 60;

function OrdersPage() {
  const { value: cart, setValue: setCart } = useCart();
  const { setValue: setOrders } = useOrders();
  const { value: settings } = useSettings();
  const [fulfilment, setFulfilment] = useState<"delivery" | "collection">("delivery");
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "", notes: "" });
  const [confirmed, setConfirmed] = useState<Order | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const fee = fulfilment === "delivery" && subtotal > 0 && subtotal < 500 ? DELIVERY_FEE : 0;
  const total = subtotal + fee;

  const setQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0),
    );

  const placeOrder = () => {
    if (cart.length === 0) return toast.error("Your cart is empty.");
    if (!customer.name.trim() || !customer.phone.trim())
      return toast.error("Please add your name and contact number.");
    if (fulfilment === "delivery" && !customer.address.trim())
      return toast.error("Please add a delivery address.");

    const order: Order = {
      id: `CC-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      items: cart,
      total,
      fulfilment,
      customer,
      status: "pending",
    };
    setOrders((prev) => [order, ...prev]);
    logActivity("Order", `Order ${order.id} placed — ${formatMoney(total)}`);
    setCart([]);
    setConfirmed(order);
    toast.success(`Order ${order.id} confirmed`);
  };

  if (confirmed) {
    return (
      <AppShell>
        <Card className="mx-auto max-w-xl shadow-float">
          <CardContent className="space-y-4 py-10 text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
            <h1 className="text-2xl font-semibold">Order confirmed</h1>
            <p className="text-sm text-muted-foreground">
              Thanks {confirmed.customer.name}! Order{" "}
              <strong className="text-foreground">{confirmed.id}</strong> for{" "}
              {formatMoney(confirmed.total)} is being prepared for {confirmed.fulfilment}.
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Button asChild>
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                    `Hi, I placed order ${confirmed.id} (${formatMoney(confirmed.total)}).`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" /> Confirm on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link to="/history">View order history</Link>
              </Button>
              <Button variant="ghost" onClick={() => setConfirmed(null)}>
                Order again
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Orders" description="Review your cart and check out." />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Your cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 && (
              <div className="space-y-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                <Button asChild variant="outline">
                  <Link to="/products">Browse ice products</Link>
                </Button>
              </div>
            )}
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(item.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="size-9" onClick={() => setQty(item.id, -1)} aria-label={`Reduce ${item.name}`}>
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                  <Button size="icon" variant="outline" className="size-9" onClick={() => setQty(item.id, 1)} aria-label={`Add ${item.name}`}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                <span className="w-20 text-right text-sm font-semibold">
                  {formatMoney(item.price * item.qty)}
                </span>
                <Button size="icon" variant="ghost" onClick={() => setQty(item.id, -item.qty)} aria-label={`Remove ${item.name}`}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fulfilment</Label>
              <RadioGroup
                value={fulfilment}
                onValueChange={(v) => setFulfilment(v as "delivery" | "collection")}
                className="grid grid-cols-2 gap-2"
              >
                {(["delivery", "collection"] as const).map((option) => (
                  <Label
                    key={option}
                    htmlFor={option}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm capitalize has-[:checked]:border-ring has-[:checked]:bg-accent"
                  >
                    <RadioGroupItem id={option} value={option} />
                    {option}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact number</Label>
              <Input id="phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
            </div>
            {fulfilment === "delivery" && (
              <div className="space-y-1.5">
                <Label htmlFor="address">Delivery address</Label>
                <Textarea id="address" rows={2} value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input id="notes" value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} placeholder="Deliver before 14:00" />
            </div>

            <Separator />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {fulfilment === "delivery" ? "Delivery" : "Collection"}
                </span>
                <span>{fee === 0 ? "Free" : formatMoney(fee)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
            <Button className="w-full" onClick={placeOrder}>
              Place order
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
