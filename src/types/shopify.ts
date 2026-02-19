export type Maybe<T> = T | null;

export type Connection<T> = {
    edges: Array<{
        node: T;
    }>;
    pageInfo?: {
        hasNextPage: boolean;
        endCursor?: string;
    };
};

export type Image = {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
};

export type Money = {
    amount: string;
    currencyCode: string;
};

export type ProductOption = {
    name: string;
    value: string;
};

export type SelectedOption = {
    name: string;
    value: string;
};

export type ProductVariant = {
    id: string;
    title: string;
    sku?: string;
    price: Money;
    compareAtPrice?: Money;
    availableForSale: boolean;
    quantityAvailable?: number;
    selectedOptions: SelectedOption[];
    image?: Image;
    product?: {
        title: string;
        handle: string;
        images?: Connection<Image>;
    };
};

export type Product = {
    id: string;
    handle: string;
    title: string;
    descriptionHtml: string;
    vendor: string;
    productType: string;
    tags: string[];
    priceRange: {
        minVariantPrice: Money;
        maxVariantPrice: Money;
    };
    compareAtPriceRange?: {
        minVariantPrice: Money;
        maxVariantPrice: Money;
    };
    images: Connection<Image>;
    variants: Connection<ProductVariant>;
    seo?: {
        title: string;
        description: string;
    };
    featuredImage?: Image;
};

export type Collection = {
    id: string;
    handle: string;
    title: string;
    description: string;
    image?: Image;
    products: Connection<Product>;
};

export type CartLine = {
    id: string;
    quantity: number;
    merchandise: {
        id: string;
        title: string;
        price: Money;
        product: {
            title: string;
            handle: string;
            images: Connection<Image>;
        };
        selectedOptions?: SelectedOption[];
    };
    cost: {
        totalAmount: Money;
    };
};

export type Cart = {
    id: string;
    checkoutUrl: string;
    lines: Connection<CartLine>;
    cost: {
        subtotalAmount: Money;
        totalAmount: Money;
        totalTaxAmount?: Money;
    };
    totalQuantity: number;
};
