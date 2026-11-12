import { AssetScorecard } from "@/components/AssetScorecard";
import { ASSET_DEMO, loadAssetView } from "@/lib/assetView";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AssetViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ compare?: string }>;
}) {
  const { id } = await params;
  const { compare } = await searchParams;
  const compareId = compare && compare !== id ? compare : undefined;

  const view = await loadAssetView(id);
  const other =
    compareId === ASSET_DEMO.gorseId || compareId === ASSET_DEMO.juniperId
      ? await loadAssetView(compareId)
      : null;

  return (
    <div className="space-y-6">
      <AssetScorecard view={view} compare={other?.id} />
      {other && (
        <div className="border-t border-slate-200 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Side by side · <Link className="underline" href={`/buildings/${other.id}`}>{other.name ?? other.id}</Link>
          </p>
          <AssetScorecard view={other} compare={view.id} />
        </div>
      )}
    </div>
  );
}
