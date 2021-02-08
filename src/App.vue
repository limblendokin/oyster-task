<template>
  <div id="app">
    <ErrorMessage :errorMessage="errorMessage"></ErrorMessage>
    <Filters v-on:submitted="onSubmit"></Filters>
    <Table :filterData="filterData" v-on:error-occured="onError"></Table>
  </div>
</template>

<script>
import Table from './components/Table';
import Filters from './components/Filters';
import ErrorMessage from './components/ErrorMessage';
export default {
  name: 'App',
  components: {
    Table,
    Filters,
    ErrorMessage
  },
  data(){
    return{
      filterData:{},
      errorMessage:''
    }
  },
  methods:{
    onError(message){
      console.log(message)
      this.errorMessage = message;
    },
    onSubmit(filterData){
      console.log(filterData)
      this.filterData = filterData;
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
