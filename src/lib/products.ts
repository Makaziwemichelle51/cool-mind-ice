import iceSmall from "@/assets/ice-small.jpg";
import iceMedium from "@/assets/ice-medium.jpg";
import iceLarge from "@/assets/ice-large.jpg";
import iceBulk from "@/assets/ice-bulk.jpg";
import iceEvent from "@/assets/ice-event.jpg";

export type Product = {
  id: string;
  name: string;
  weight: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
  stockNote: string;
};

export const BUSINESS = {
  name: "Cool Cubes",
  tagline: "Crystal-clear ice, delivered cold.",
  whatsapp: "27820000000",
  email: "orders@coolcubes.co.za",
  currency: "R",
};

export const products: Product[] = [
  {
    id: "small",
    name: "Small Ice Bag",
    weight: "2 kg",
    price: 25,
    image: iceSmall,
    description: "Perfect for home use, coolers and everyday drinks.",
    inStock: true,
    stockNote: "In stock",
  },
  {
    id: "medium",
    name: "Medium Ice Bag",
    weight: "5 kg",
    price: 45,
    image: iceMedium,
    description: "Great for braais, small gatherings and offices.",
    inStock: true,
    stockNote: "In stock",
  },
  {
    id: "large",
    name: "Large Ice Bag",
    weight: "10 kg",
    price: 80,
    image: iceLarge,
    description: "Ideal for parties, restaurants and long events.",
    inStock: true,
    stockNote: "In stock",
  },
  {
    id: "bulk",
    name: "Bulk Ice",
    weight: "50 kg pallet",
    price: 340,
    image: iceBulk,
    description: "Wholesale pricing for venues, shops and caterers.",
    inStock: true,
    stockNote: "Limited daily stock",
  },
  {
    id: "event",
    name: "Event Ice Package",
    weight: "100 kg + coolers",
    price: 690,
    image: iceEvent,
    description: "Ice, insulated tubs and scheduled top-ups for events.",
    inStock: false,
    stockNote: "Pre-order only",
  },
];

export const formatMoney = (value: number) =>
  `${BUSINESS.currency}${value.toFixed(2)}`;
