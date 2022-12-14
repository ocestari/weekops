import { v4 as uuid } from "uuid";

export const LS = {
  get: (key: string) => {
    return localStorage.getItem(key);
  },
  set: (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
};

export interface Item {
  id: string;
  type: "task" | "note" | "event";
  date: Date;
  name: string;
  description?: string;
  done?: boolean;
  time?: Date;
}

export function getNewId({ date }: Omit<Item, "id">) {
  const year = date.getFullYear();
  const day = date.getDate();
  const month = date.getMonth() + 1;

  const id = `${year}.${month}.${day}.${uuid()}`;

  return id;
}

export function addItem(item: Omit<Item, "id">) {
  const items = getItems();
  const newItem = {
    ...item,
    id: getNewId(item),
    done: item.done || false,
  };
  items.push(newItem);
  LS.set("items", JSON.stringify(items));
}
export function getItems(): Item[] {
  return JSON.parse(LS.get("items") || "[]");
}
export function getItemsFromDay(date: Date): Item[] {
  const items = getItems();
  return items.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getFullYear() === date.getFullYear() &&
      itemDate.getMonth() === date.getMonth() &&
      itemDate.getDate() === date.getDate()
    );
  });
}

export function removeItem(id: string) {
  const items = getItems();
  const newItems = items.filter((item) => item.id !== id);
  LS.set("items", JSON.stringify(newItems));
}

export function updateItem(item: Item) {
  const items = getItems();
  const newItems = items.map((i) => (i.id === item.id ? { ...i, ...item } : i));
  LS.set("items", JSON.stringify(newItems));
}

export function moveItem(id: string, date: Date) {
  const items = getItems();
  const itemCopy = items.find((item) => item.id === id);
  if (itemCopy) {
    addItem({ ...itemCopy, date });
    removeItem(id);
  }
}
