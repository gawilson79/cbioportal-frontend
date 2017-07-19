import * as React from 'react';
import {Button, ButtonGroup, FormGroup, FormControl} from 'react-bootstrap';
import styles from "../paginationControls/paginationControls.module.scss";
import { If, Then, Else } from 'react-if';
import {observable} from "mobx";
import {observer} from "mobx-react";
import classNames from 'classnames';

export const SHOW_ALL_PAGE_SIZE = -1;

export const MAX_DIGITS = 6;

export interface IShowMoreButtonProps {
    currentPage?:number;
    itemsPerPage?:number;
    itemsPerPageOptions?:number[];
    showAllOption?:boolean;
    onChangeItemsPerPage?:(itemsPerPage:number)=>void;
    className?:string;
}

@observer
export class ShowMoreControls extends React.Component<IShowMoreButtonProps, {}> {
    public static defaultProps = {
        itemsPerPage: SHOW_ALL_PAGE_SIZE,
        itemsPerPageOptions: [10, 25, 50, 100],
        showAllOption: true,
        className: "",
    };
    counter: number;
    showMoreItems:number[];
    constructor(props:IShowMoreButtonProps) {
        super(props);
        this.handleChangeItemsPerPage = this.handleChangeItemsPerPage.bind(this);
        this.counter = 0;
        this.showMoreItems = [10,25,50,100,SHOW_ALL_PAGE_SIZE];
        
    }

    private pageNumberInput: HTMLSpanElement;

    
    handleChangeItemsPerPage() {

        if (this.props.onChangeItemsPerPage) {
            if (this.props.itemsPerPage){
                this.counter = this.showMoreItems.indexOf(this.props.itemsPerPage)+1;
                if (this.counter < this.showMoreItems.length){
                    this.props.onChangeItemsPerPage(this.showMoreItems[this.counter]);
                }
            }
        }
    }

    

    
    render() {
        const pageSizeOptionElts = (this.props.itemsPerPageOptions || []).map((opt:number) => (<option key={opt} value={opt+""}>{opt}</option>));
        if (this.props.showAllOption) {
            pageSizeOptionElts.push(<option key="all" value={SHOW_ALL_PAGE_SIZE+""}>all</option>);
        }

        return (
            <div >
                <Button bsSize="sm" block disabled={this.props.itemsPerPage==SHOW_ALL_PAGE_SIZE} onClick={this.handleChangeItemsPerPage }>Show More</Button> 
                   
            </div>
        );
    }
}

export default ShowMoreControls;