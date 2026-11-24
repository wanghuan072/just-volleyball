import catalog from "@/data/locker-catalog.json";
import { LockerStudio, type LockerCatalog } from "@/components/locker-studio";
import { Breadcrumbs } from "@/components/shared";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("/tools/locker/");
export default function Page(){return <><Breadcrumbs items={[{name:"Tools",href:"/tools/"},{name:"Locker",href:"/tools/locker/"}]}/><LockerStudio catalog={catalog as unknown as LockerCatalog}/></>;}
