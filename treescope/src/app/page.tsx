"use client";

import { useState, useCallback } from "react";
import { TreePine, Leaf, RefreshCw } from "lucide-react";
import CameraCapture from "@/components/CameraCapture";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TreeInfo {
  commonName: string;
  scientificName: string;
  description: string;
  careTips: string;
}

export default function Home() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [treeInfo, setTreeInfo] = useState<TreeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = useCallback(async (imageBase64: string) => {
    setCapturedImage(imageBase64);
    setTreeInfo(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "解析に失敗しました。");
      }

      const data: TreeInfo = await response.json();
      setTreeInfo(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "エラーが発生しました。もう一度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setCapturedImage(null);
    setTreeInfo(null);
    setError(null);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
      {/* Header */}
      <header className="mb-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <TreePine className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold tracking-tight text-green-800 dark:text-green-400">
            TreeScope
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          樹木を撮影して、名前や特徴を調べよう
        </p>
      </header>

      {/* Camera or Result */}
      {!capturedImage ? (
        <section className="flex flex-1 flex-col items-center justify-center">
          <CameraCapture onCapture={handleCapture} disabled={loading} />
          <p className="mt-4 text-center text-xs text-gray-400">
            カメラで樹木を撮影すると、AIが種類を特定します
          </p>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          {/* Captured image */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="撮影した樹木"
              className="w-full object-cover"
            />
          </div>

          {/* Loading skeleton */}
          {loading && (
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-40" />
                <Skeleton className="mt-1 h-4 w-56" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {treeInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-6 w-6 text-green-600" />
                  {treeInfo.commonName}
                </CardTitle>
                <CardDescription className="italic">
                  {treeInfo.scientificName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    特徴
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {treeInfo.description}
                  </p>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    育て方・注意点
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {treeInfo.careTips}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reset button */}
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            もう一度撮影する
          </Button>
        </section>
      )}
    </main>
  );
}
