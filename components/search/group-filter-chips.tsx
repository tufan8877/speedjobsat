import { Link, useSearch } from "wouter";
import { categoryGroups, getServiceCategoryLabel } from "@shared/schema";

export default function GroupFilterChips() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const groupKey = params.get("group");
  const activeService = params.get("service");

  const group = groupKey ? categoryGroups.find((candidate) => candidate.key === groupKey) : undefined;
  if (!group) return null;

  const buildHref = (service?: string) => {
    const next = new URLSearchParams(params);
    next.set("group", group.key);
    if (service) next.set("service", service);
    else next.delete("service");
    return `/suche?${next.toString()}`;
  };

  const chipClass = (isActive: boolean) =>
    `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
      isActive ? "bg-primary text-white" : "bg-accent text-primary hover:bg-secondary hover:text-white"
    }`;

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <Link href={buildHref()} className={chipClass(!activeService)}>
        Alle {group.label}
      </Link>
      {group.services.map((service) => (
        <Link key={service} href={buildHref(service)} className={chipClass(activeService === service)}>
          {getServiceCategoryLabel(service)}
        </Link>
      ))}
    </div>
  );
}
