import ThanksContent from "./ThanksContent";

export const dynamic = "force-dynamic";

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
    const params = await searchParams;
    return <ThanksContent projectId={params?.project} />;
}
