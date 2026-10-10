import {
    bkdRules,
} from "./bkdRules";


interface FindBKDRuleInput {
    jenisAlat: string;
    kelas: string;
    pengujian: string;
}


export function findBKDRule(
    input: FindBKDRuleInput
) {

    return bkdRules.find(rule =>

        rule.jenisAlat.includes(
            input.jenisAlat
        )

        &&

        rule.kelas === input.kelas

        &&

        rule.pengujian.includes(
            input.pengujian
        )

    );

}