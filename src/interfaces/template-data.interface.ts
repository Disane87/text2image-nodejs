export interface TemplateData {
    url?: string;

    queryParams?: { [key: string]: unknown };

    data?: { [key: string]: unknown };

    openGraph?: { [key: string]: string };
}
