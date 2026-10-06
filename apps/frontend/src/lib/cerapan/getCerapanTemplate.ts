import { cerapanTemplates } from "./templates";


export function getCerapanTemplate(jenisAlat: string) {
    return cerapanTemplates[jenisAlat as keyof typeof cerapanTemplates];
}