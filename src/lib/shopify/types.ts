
export type ShopifyConfig = {
    storeDomain: string;
    apiVersion: string;
    publicAccessToken: string;
};

export type Connection<T> = {
    edges: Array<{
        node: T;
    }>;
};

export type Image = {
    url: string;
    altText: string;
    width: number;
    height: number;
};

export type Money = {
    amount: string;
    currencyCode: string;
};

export type SEO = {
    title: string;
    description: string;
};

export type ProductOption = {
    id: string;
    name: string;
    values: string[];
};

export type ProductVariant = {
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: {
        name: string;
        value: string;
    }[];
    price: Money;
    image?: Image;
};

export type Metafield = {
    id: string;
    key: string;
    namespace: string;
    value: string;
    type: string;
};

export type Product = {
    id: string;
    handle: string;
    title: string;
    description: string;
    descriptionHtml: string;
    featuredImage: Image;
    images: Connection<Image>;
    priceRange: {
        minVariantPrice: Money;
        maxVariantPrice: Money;
    };
    variants: Connection<ProductVariant>;
    options: ProductOption[];
    seo: SEO;
    tags: string[];
    updatedAt: string;
    metafields: (Metafield | null)[];
};

export type Collection = {
    id: string;
    handle: string;
    title: string;
    description: string;
    seo: SEO;
    path: string;
    updatedAt: string;
    products: Connection<Product>;
};

export type DeliveryOption = {
    handle: string;
    title: string;
    description?: string;
    estimatedCost: Money;
};

export type DeliveryGroup = {
    id: string;
    deliveryOptions: DeliveryOption[];
    selectedDeliveryOption?: DeliveryOption;
};

export type Cart = {
    id: string;
    checkoutUrl: string;
    totalQuantity: number;
    lines: Connection<CartLine>;
    cost: {
        subtotalAmount: Money;
        totalAmount: Money;
        totalTaxAmount: Money;
    };
    deliveryGroups: Connection<DeliveryGroup>;
};

export type CartLine = {
    id: string;
    quantity: number;
    cost: {
        totalAmount: Money;
    };
    merchandise: {
        id: string;
        title: string;
        product: {
            title: string;
            handle: string;
        };
        price: Money;
        image: Image;
    };
};

