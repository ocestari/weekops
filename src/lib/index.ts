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

interface BaseItem {
  id: string;
  date: Date;
  name: string;
  description?: string;
}

interface TaskItem extends BaseItem {
  type: "task";
  done?: boolean;
}

interface NoteItem extends BaseItem {
  type: "note";
}

interface EventItem extends BaseItem {
  type: "event";
  time?: Date;
}

export type Item = TaskItem | NoteItem | EventItem;

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
  const newItems = items.map((i) => (i.id === item.id ? item : i));
  LS.set("items", JSON.stringify(newItems));
}
