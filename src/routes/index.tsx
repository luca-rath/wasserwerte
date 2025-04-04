import { createFileRoute } from '@tanstack/react-router'
import { type FormEvent, useRef, useState } from "react";
import { useLocalStorageState } from "@/useLocalStorageState.ts";
import { chain } from "mathjs";

export const Route = createFileRoute('/')({
    component: App,
})

type Values = {
    magnesium: number;
    calcium: number;
    potassium: number;
    totalPhosphate: number;
    orthoPhosphate: number;
    nitrate: number;
}

function calculateProblemsMagnesiumCalcium(values: Values): string[] {
    const problems: string[] = [];

    const magnesiumIdeal = chain(values.calcium).divide(5).multiply(2);
    const magnesiumMin = magnesiumIdeal.multiply(0.9);
    const magnesiumMax = magnesiumIdeal.multiply(1.1);

    const calciumIdeal = chain(values.magnesium).divide(2).multiply(5);
    const calciumMin = calciumIdeal.multiply(0.9);
    const calciumMax = calciumIdeal.multiply(1.1);

    if (values.calcium < calciumMin.done() || values.magnesium > magnesiumMax.done()) {
        problems.push(`Kalzium auf <b>${calciumIdeal.round(2).done()} mg/l</b> erhöhen oder Magnesium auf <b>${magnesiumIdeal.round(2).done()} mg/l</b> verringern.`);
    }

    if (values.calcium > calciumMax.done() || values.magnesium < magnesiumMin.done()) {
        problems.push(`Kalzium auf <b>${calciumIdeal.round(2).done()} mg/l</b> verringern oder Magnesium auf <b>${magnesiumIdeal.round(2).done()} mg/l</b> erhöhen.`);
    }

    return problems;
}

function calculateProblemsMagnesiumPotassium(values: Values): string[] {
    const problems: string[] = [];

    const magnesiumIdeal = chain(values.potassium).divide(5).multiply(2);
    const magnesiumMin = magnesiumIdeal.multiply(0.9);
    const magnesiumMax = magnesiumIdeal.multiply(1.1);

    const potassiumIdeal = chain(values.magnesium).divide(2).multiply(5);
    const potassiumMin = potassiumIdeal.multiply(0.9);
    const potassiumMax = potassiumIdeal.multiply(1.1);

    if (values.potassium < potassiumMin.done() || values.magnesium > magnesiumMax.done()) {
        problems.push(`Kalium auf <b>${potassiumIdeal.round(2).done()} mg/l</b> erhöhen oder Magnesium auf <b>${magnesiumIdeal.round(2).done()} mg/l</b> verringern.`);
    }

    if (values.potassium > potassiumMax.done() || values.magnesium < magnesiumMin.done()) {
        problems.push(`Kalium auf <b>${potassiumIdeal.round(2).done()} mg/l</b> verringern oder Magnesium auf <b>${magnesiumIdeal.round(2).done()} mg/l</b> erhöhen.`);
    }

    return problems;
}

function calculateProblemsTotalPhosphateNitrate(values: Values): string[] {
    const problems: string[] = [];

    const totalPhosphateIdeal = chain(values.nitrate).divide(16).multiply(1);
    const totalPhosphateMin = totalPhosphateIdeal.multiply(0.9);
    const totalPhosphateMax = totalPhosphateIdeal.multiply(1.1);

    const nitrateIdeal = chain(values.totalPhosphate).divide(1).multiply(16);
    const nitrateMin = nitrateIdeal.multiply(0.9);
    const nitrateMax = nitrateIdeal.multiply(1.1);

    if (values.nitrate < nitrateMin.done() || values.totalPhosphate > totalPhosphateMax.done()) {
        problems.push(`Nitrat auf <b>${nitrateIdeal.round(2).done()} mg/l</b> erhöhen oder Gesamtphosphat auf <b>${totalPhosphateIdeal.round(2).done()} mg/l</b> verringern.`);
    }

    if (values.nitrate > nitrateMax.done() || values.totalPhosphate < totalPhosphateMin.done()) {
        problems.push(`Nitrat auf <b>${nitrateIdeal.round(2).done()} mg/l</b> verringern oder Gesamtphosphat auf <b>${totalPhosphateIdeal.round(2).done()} mg/l</b> erhöhen.`);
    }

    return problems;
}

function calculateProblemsTotalPhosphate(values: Values): string[] {
    if (values.totalPhosphate > 0.05) {
        return ["Gesamtphosphat sollte <b>0.05 mg/l</b> nicht überschreiten."];
    }

    return [];
}

function calculateProblemsOrthoPhosphate(values: Values): string[] {
    if (values.orthoPhosphate > 0.03) {
        return ["Orthophosphat sollte <b>0.03 mg/l</b> nicht überschreiten."];
    }

    return [];
}

function calculateProblems(values: Values) {
    return ([] as string[]).concat(
        calculateProblemsMagnesiumCalcium(values),
        calculateProblemsMagnesiumPotassium(values),
        calculateProblemsTotalPhosphateNitrate(values),
        calculateProblemsTotalPhosphate(values),
        calculateProblemsOrthoPhosphate(values),
    );
}

function App() {
    const formRef = useRef<HTMLFormElement>(null);
    const [values, setValues] = useState<Values | null>(null);
    const [problems, setProblems] = useState<string[] | null>(null);

    const [magnesium, setMagnesium] = useLocalStorageState<string>("magnesium", "");
    const [calcium, setCalcium] = useLocalStorageState<string>("calcium", "");
    const [potassium, setPotassium] = useLocalStorageState<string>("potassium", "");
    const [totalPhosphate, setTotalPhosphate] = useLocalStorageState<string>("total_phosphate", "");
    const [orthoPhosphate, setOrthoPhosphate] = useLocalStorageState<string>("ortho_phosphate", "");
    const [nitrate, setNitrate] = useLocalStorageState<string>("nitrate", "");

    function calculate() {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);

        const values: Values = {
            magnesium: Number(formData.get("magnesium")),
            calcium: Number(formData.get("calcium")),
            potassium: Number(formData.get("potassium")),
            totalPhosphate: Number(formData.get("total_phosphate")),
            orthoPhosphate: Number(formData.get("ortho_phosphate")),
            nitrate: Number(formData.get("nitrate")),
        }

        setValues(values);
        setProblems(calculateProblems(values));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        calculate();
    }

    function handleChange() {
        if (values !== null) {
            setValues(null);
            setProblems(null);
        }
    }

    function handleClear() {
        setMagnesium("");
        setCalcium("");
        setPotassium("");
        setTotalPhosphate("");
        setOrthoPhosphate("");
        setNitrate("");

        if (formRef.current) {
            formRef.current.reset();
        }
    }

    return (
        <div>
            <h1>Wasserwerte</h1>

            <form onSubmit={handleSubmit} ref={formRef}>
                <table>
                    <tbody>
                    <tr>
                        <td><label htmlFor="magnesium">Magnesium (mg/l)</label></td>
                        <td>
                            <input id="magnesium" name="magnesium" type="number" required={true} min={0} step="any" defaultValue={magnesium}
                                   onChange={(e) => {
                                       setMagnesium(e.currentTarget.value);
                                       handleChange();
                                   }} />
                        </td>
                    </tr>

                    <tr>
                        <td><label htmlFor="calcium">Kalzium (mg/l)</label></td>
                        <td>
                            <input id="calcium" name="calcium" type="number" required={true} min={0} step="any" defaultValue={calcium}
                                   onChange={(e) => {
                                       setCalcium(e.currentTarget.value);
                                       handleChange();
                                   }} />
                        </td>
                    </tr>

                    <tr>
                        <td><label htmlFor="potassium">Kalium (mg/l)</label></td>
                        <td>
                            <input id="potassium" name="potassium" type="number" required={true} min={0} step="any" defaultValue={potassium}
                                   onChange={(e) => {
                                       setPotassium(e.currentTarget.value);
                                       handleChange();
                                   }} />
                        </td>
                    </tr>

                    <tr>
                        <td><label htmlFor="total_phosphate">Gesamtphosphat (mg/l)</label></td>
                        <td>
                            <input id="total_phosphate" name="total_phosphate" type="number" required={true} min={0} step="any"
                                   defaultValue={totalPhosphate}
                                   onChange={(e) => {
                                       setTotalPhosphate(e.currentTarget.value);
                                       handleChange();
                                   }} />
                        </td>
                    </tr>

                    <tr>
                        <td><label htmlFor="ortho_phosphate">Orthophosphat (mg/l)</label></td>
                        <td>
                            <input id="ortho_phosphate" name="ortho_phosphate" type="number" required={true} min={0} step="any"
                                   defaultValue={orthoPhosphate}
                                   onChange={(e) => {
                                       setOrthoPhosphate(e.currentTarget.value);
                                       handleChange();
                                   }} />
                        </td>
                    </tr>

                    <tr>
                        <td><label htmlFor="nitrate">Nitrat (mg/l)</label></td>
                        <td>
                            <input id="nitrate" name="nitrate" type="number" required={true} min={0} step="any" defaultValue={nitrate}
                                   onChange={(e) => {
                                       setNitrate(e.currentTarget.value);
                                       handleChange();
                                   }} />
                        </td>
                    </tr>
                    </tbody>
                </table>

                <br />

                <div>
                    <button type="submit">Berechnen</button>
                    &nbsp;
                    <button type="button" onClick={handleClear}>Leeren</button>
                </div>
            </form>

            {!!problems?.length && <div>
                <h3 style={{ marginTop: 32, marginBottom: 0 }}>Probleme</h3>
                <ul style={{ marginBlock: 8, paddingLeft: 20 }}>{problems.map((problem) => <>
                    <li style={{ paddingBlock: 4 }} key={btoa(problem)}
                        dangerouslySetInnerHTML={{ __html: problem }} />
                </>)}</ul>
            </div>}

            {!!values && !problems?.length && <div>
                <p style={{ marginTop: 32, marginBottom: 0 }}>Keine Probleme erkannt</p>
            </div>}
        </div>
    )
}
