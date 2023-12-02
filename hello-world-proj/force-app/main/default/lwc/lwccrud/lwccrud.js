import { LightningElement, track, wire } from 'lwc';
import getAccountList from '@salesforce/apex/AccountDataController.getAccountList';
import deleteSelectedAccount from '@salesforce/apex/AccountDataController.deleteSelectedAccount';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
const actions = [
   { label: 'Edit', name: 'Edit' },
    
    { label: 'Show details', name: 'show_details' },

    { label: 'Delete', name: 'delete' },
];
const columns=[
{label: 'Account Name', fieldName: 'Name'},
{label: 'Account Industry', fieldName: 'Industry',editable: true},
{label: 'Account Description', fieldName: 'Description',editable: true},
{label: 'Parent Account Name', fieldName: 'Parent_Account_Name'},
{    type: 'action',
    typeAttributes: { rowActions: actions },
},
];

export default class Lwccrud extends LightningElement {
    @track error;
    @track columns = columns;
    @track actions = actions;
    @track accList;
   @track isShowModal = false;
    @track isEditRecord = false;
    @track recordIdToEdit;
    @track showLoadingSpinner = false;
   
    refreshTable;
   
    //@wire(getAccountList) accounts;

    @wire (getAccountList) accList(result)
    {
        this.refreshTable = result;
        if(result.data)
        {        

            let accParsedData=JSON.parse(JSON.stringify(result.data));
            let baseUrlOfOrg= 'https://'+location.host+'/';
            accParsedData.forEach(acc => {
                if(acc.ParentId){
                acc.Parent_Account_Name=acc.Parent.Name;
             
                }
            });
        
            this.accList = accParsedData;
        }
        else if(result.error)
        {
            this.error = result.error;
        }   
    }
   

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'Edit':
                this.editRecord(row.Id);
                break;
            case 'delete':
                    this.deleteRecord(row.Id);
                    alert('delete record1');
                    break;
            default:
                alert('delete record');
        }
    }

    editRecord(recordIdDetail) {
        this.isShowModal = true;
        this.isEditRecord = true;
        this.recordIdToEdit=recordIdDetail;
    }
    deleteRecord(recordIdToDelete) {
        alert(recordIdToDelete);
        this.showLoadingSpinner = true;
        deleteSelectedAccount({recordIdToDelete:recordIdToDelete})
        .then(result =>{
            this.showLoadingSpinner = false;
            const evt = new ShowToastEvent({
                title: 'Success Message',
                message: 'Record deleted successfully ', 
                variant: 'success', 
                mode:'dismissible'  

            }); 
            this.dispatchEvent(evt);
           return refreshApex(this.refreshTable);
        } )
        .catch(error => {
            this.error = error;
        });
    }
    hideModalBox() { 
        this.isShowModal = false;
    }
    handleSubmit(event){

        this.isShowModal = false;
        const evt = new ShowToastEvent({
            title: 'Success Message',
            message: 'Record Updated successfully ',
            variant: 'success',
            mode:'dismissible'
        });
        this.dispatchEvent(evt);
    }
    handleSuccess(event){

        return refreshApex(this.refreshTable); 

    }
}