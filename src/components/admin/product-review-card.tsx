"use client";

import { useState } from 'react';
import { publishProductAction } from '@/app/actions/publish-product';
import { doc, deleteDoc, setDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Save } from "lucide-react";

interface DraftReviewCardProps {
    draft: {
        id: string;
        title: string;
        description: string;
        price: number | null;
        sku: string;
        tags: string[];
    };
}

export function DraftReviewCard({ draft }: DraftReviewCardProps) {
    const [formData, setFormData] = useState(draft);
    const [isPublishing, setIsPublishing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePublish = async () => {
        setIsPublishing(true);

        const result = await publishProductAction(draft.id, formData);

        if (result.success) {
            const db = getFirestore(app);
            try {
                await setDoc(doc(db, 'products_live', result.shopifyId), {
                    ...formData,
                    shopifyId: result.shopifyId,
                    handle: result.handle,
                    status: 'active',
                    promoted_at: new Date().toISOString(),
                    embedding_reindex_needed: true
                });

                await deleteDoc(doc(db, 'product_drafts', draft.id));
                // Optional: Toast notification here using toast()
            } catch (err) {
                console.error("Error promoting:", err);
            }
        } else {
            console.error(result.error);
            setIsPublishing(false);
        }
    };

    const handleDiscard = async () => {
        if (!confirm("Are you sure you want to discard this draft?")) return;
        const db = getFirestore(app);
        await deleteDoc(doc(db, 'product_drafts', draft.id));
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-bold text-gray-900 line-clamp-1">{draft.title}</CardTitle>
                        <CardDescription className="text-xs font-mono">{draft.sku}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white">Draft</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold text-gray-500 uppercase">Product Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="bg-gray-50/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-xs font-bold text-gray-500 uppercase">Price (Cents)</Label>
                        <Input
                            id="price"
                            name="price"
                            value={formData.price || ''}
                            onChange={handleChange}
                            placeholder="e.g. 1999"
                            className="bg-gray-50/50"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-bold text-gray-500 uppercase">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="h-32 bg-gray-50/50 resize-None"
                    />
                </div>
            </CardContent>
            <CardFooter className="bg-gray-50/30 p-4 flex justify-end gap-3 border-t border-gray-100">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDiscard}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Discard
                </Button>
                <Button
                    size="sm"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-black hover:bg-gray-800 text-white font-bold"
                >
                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isPublishing ? 'Publishing...' : 'Approve & Publish'}
                </Button>
            </CardFooter>
        </Card>
    );
}
