import * as React from 'react';
import DefaultTooltip from 'shared/components/DefaultTooltip';
import {Mutation} from "shared/api/generated/CBioPortalAPI";
import styles from "./mutationClonal.module.scss";

interface IMutationClonalFormat {
    label?: string;
    longName?: string;
    className: string;
    mainType: string;
    priority?: number;
}

/**
 * @author Gareth Wilson
 */
export default class MutationClonalColumnFormatter
{
    public static get MAIN_MUTATION_CLONAL_MAP():{[key:string]: IMutationClonalFormat} {
        return {
            clonal: {label: "Clonal",
                longName: "Clonal Mutation",
                className: "clonal-mutation",
                mainType: "clonal",
                priority: 1},
            subclonal: {label: "Subclonal",
                longName: "Subclonal Mutation",
                className: "subclonal-mutation",
                mainType: "subclonal",
                priority: 2},
            unknown: {
                label: "Unknown",
                longName: "Unknown status",
                className: "unknown-status",
                mainType: "unknown",
                priority: 3},
            na: {label: "NA",
                longName: "NA-tmp",
                className: "na",
                mainType: "na",
                priority: 4},
            
        };
    }

    /**
     * Determines the display value by using the impact field.
     *
     * @param data  column formatter data
     * @returns {string}    mutation assessor text value
     */
    public static getDisplayValue(data:Mutation[]):string
    {
        const entry:IMutationClonalFormat|undefined =
            MutationClonalColumnFormatter.getMapEntry(data);

        // first, try to find a mapped value
        if (entry && entry.label) {
            return entry.label;
        }
        // if no mapped value, then return the text value as is
        else {
            return MutationClonalColumnFormatter.getTextValue(data);
        }
    }

    public static getTextValue(data:Mutation[]):string
    {
        let textValue:string = "";
        const dataValue = MutationClonalColumnFormatter.getData(data);

        if (dataValue) {
            textValue = dataValue.toString();
        }

        return textValue;
    }

    public static getClassName(data:Mutation[]):string
    {
        const value:IMutationClonalFormat|undefined =
            MutationClonalColumnFormatter.getMapEntry(data);

        if (value && value.className) {
            return value.className;
        }
        // for unmapped values, use the "other" style
        else {
            return MutationClonalColumnFormatter.MAIN_MUTATION_CLONAL_MAP["other"].className;
        }
    }

    public static getMapEntry(data:Mutation[])
    {
        const mutationClonal = MutationClonalColumnFormatter.getData(data);

        if (mutationClonal) {
            return MutationClonalColumnFormatter.MAIN_MUTATION_CLONAL_MAP[mutationClonal];
        }
        else {
            return undefined;
        }
    }

    public static getData(data:Mutation[])
    {
        if (data.length > 0) {
            return data[0].clonalStatus;
        } else {
            return null;
        }
    }

    public static renderFunction(data:Mutation[])
    {
        // use text for all purposes (display, sort, filter)
        const text:string = MutationClonalColumnFormatter.getDisplayValue(data);
        const className:string = MutationClonalColumnFormatter.getClassName(data);

        // use actual value for tooltip
        const toolTip:string = MutationClonalColumnFormatter.getTextValue(data);

        let content = <span className={styles[className]}>{text}</span>;

        // add tooltip only if the display value differs from the actual text value!
        if (toolTip.toLowerCase() !== text.toLowerCase())
        {
            const arrowContent = <div className="rc-tooltip-arrow-inner"/>;

            content = (
                <DefaultTooltip overlay={<span>{toolTip}</span>} placement="left" arrowContent={arrowContent}>
                    {content}
                </DefaultTooltip>
            );
        }

        return content;
    }
}

