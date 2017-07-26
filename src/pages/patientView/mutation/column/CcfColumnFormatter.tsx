import * as React from 'react';
import {If, Else, Then } from 'react-if';
import DefaultTooltip from "shared/components/DefaultTooltip";
import 'rc-tooltip/assets/bootstrap_white.css';
import {Mutation} from "../../../../shared/api/generated/CBioPortalAPI";
import SampleManager from "../../sampleManager";
import {isUncalled} from '../../../../shared/lib/mutationUtils';

export default class CcfColumnFormatter {
    static barWidth = 6;
    static barSpacing = 3;
    static maxBarHeight = 12;
    static indexToBarLeft = (n:number) => n*(CcfColumnFormatter.barWidth + CcfColumnFormatter.barSpacing);

    public static getComponentForSampleArgs<T extends {ccf:number,geneticProfileId:string}>(mutation:T) {
        const ccf = mutation.ccf;

        let opacity: number = 1;
        let extraTooltipText: string = '';
        if (isUncalled(mutation.geneticProfileId)) {
            if (ccf > 0) {
                opacity = 0.1;
                extraTooltipText = "Mutation has supporting reads, but wasn't called";
            } else {
                opacity = 0;
                extraTooltipText = "Mutation has 0 supporting reads and wasn't called";
            }
        }
        return {
           opacity,
           extraTooltipText
        };
    }

    public static convertMutationToSampleElement<T extends {sampleId:string, ccf:number, geneticProfileId:string}>(mutation:T, color:string, barX:number, sampleComponent:any) {
            
            const ccf = mutation.ccf;
            if (ccf < 0) {
                return null;
            }

            const freq = ccf;
            const barHeight = (isNaN(freq) ? 0 : freq)*CcfColumnFormatter.maxBarHeight;
            const barY = CcfColumnFormatter.maxBarHeight - barHeight;


            const bar = (<rect x={barX} y={barY} width={CcfColumnFormatter.barWidth} height={barHeight} fill={color}/>);
            const backBar = (<rect x={barX} y={0} width={CcfColumnFormatter.barWidth} height={CcfColumnFormatter.maxBarHeight} fill={"#ccc"}/>);
            //const variantReadText:string = `${isUncalled(mutation.geneticProfileId)? "(uncalled) " : ""}(${altReads} variant reads out of ${altReads+refReads} total)`;
            const text = (<span>
                    <strong>{freq.toFixed(2)}</strong> 
                </span>);
            return {
                sampleId:mutation.sampleId, bar, component:sampleComponent, text, freq, backBar
            };
    }

    public static renderFunction(mutations:Mutation[], sampleManager:SampleManager|null) {
        if (!sampleManager) {
            return (<span></span>);
        }

        const sampleOrder = sampleManager.getSampleIdsInOrder();
        const barX = sampleOrder.reduce((map:{[s:string]:number}, sampleId:string, i:number) => {map[sampleId] = CcfColumnFormatter.indexToBarLeft(i); return map;}, {});
        const sampleElements = mutations.map((m:Mutation) => {
            const args = CcfColumnFormatter.getComponentForSampleArgs(m);
            return CcfColumnFormatter.convertMutationToSampleElement(
                m,
                sampleManager.getColorForSample(m.sampleId),
                barX[m.sampleId],
                sampleManager.getComponentForSample(m.sampleId, args.opacity, args.extraTooltipText)
            );
        });
        const sampleToElements = sampleElements.reduce((map:{[s:string]:any}, elements:any) => {if (elements) { map[elements.sampleId] = elements } return map; }, {});
        const elementsInSampleOrder = sampleOrder.map((sampleId:string) => sampleToElements[sampleId]).filter((x:any) => !!x);
        const tooltipLines = elementsInSampleOrder.map((elements:any)=>(<span key={elements.sampleId}>{elements.component}  {elements.text}<br/></span>));
        const freqs = sampleOrder.map((sampleId:string) => (sampleToElements[sampleId] && sampleToElements[sampleId].freq) || undefined);
        const bars = elementsInSampleOrder.map((elements:any)=>elements.bar);
        const backBars = elementsInSampleOrder.map((elements:any)=>elements.backBar);
        //Array.from(new Array(4),(val,index)=>1)
        //const backBars = elementsInSampleOrder.map((elements:any)=>Array.from(new Array(4),(val,index)=>1));

        let content:JSX.Element = <span />;

        // single sample: just show the number
        if (sampleManager.samples.length === 1) {
            content = <span>{ (!isNaN(freqs[0]) ? freqs[0].toFixed(2) : '') }</span>;
        }
        // multiple samples: show a graphical component
        // (if no tooltip info available do not update content)
        else if (tooltipLines.length > 0) {
            content = (
                <svg
                    width={CcfColumnFormatter.getSVGWidth(sampleOrder.length)}
                    height={CcfColumnFormatter.maxBarHeight}
                >
                    {backBars}
                    {bars}
                </svg>
            );
        }

        // as long as we have tooltip lines, show tooltip in either cases (single or multiple)
        if (tooltipLines.length > 0)
        {
            const overlay = () => <span>{tooltipLines}</span>;

            content = (
                <DefaultTooltip
                    placement="left"
                    overlay={overlay}
                    arrowContent={<div className="rc-tooltip-arrow-inner"/>}
                    destroyTooltipOnHide={true}
                >
                    {content}
                </DefaultTooltip>
            );
        }

        return content;
    }

    public static getSVGWidth(numSamples:number) {
        return numSamples*CcfColumnFormatter.barWidth + (numSamples-1)*CcfColumnFormatter.barSpacing
    }

    public static getSortValue(d:Mutation[], sampleManager:SampleManager|null) {
        if (!sampleManager) {
            return [null];
        }

        // frequencies in sample order
        const sampleToMutation = d.reduce((map:{[s:string]:Mutation}, next:Mutation)=>{
            map[next.sampleId] = next;
            return map;
        }, {});
        return sampleManager.getSampleIdsInOrder().map(sampleId=>sampleToMutation[sampleId]).map(mutation=>{
            if (!mutation) {
                return null;
            }
            const ccf = mutation.ccf;
            return (ccf);
        });
    }
}
