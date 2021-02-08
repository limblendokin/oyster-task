<template>
  <div>
    <a-table
      :data-source="data.clients"
      :row-key="(client) => client.id"
      :columns="columns"
      :pagination="{ ...pagination, total: data.totalCount }"
      @change="handleTableChange"
      :loading="$apollo.loading"
    >
      <div
        slot="filterDropdown"
        slot-scope="{
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          column,
        }"
        style="padding: 8px"
      >
        <a-input
          v-ant-ref="(c) => (searchInput = c)"
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          style="width: 188px; margin-bottom: 8px; display: block;"
          @change="
            (e) => setSelectedKeys(e.target.value ? [e.target.value] : [])
          "
          @pressEnter="
            () => handleSearch(selectedKeys, confirm, column.dataIndex)
          "
        />
        <a-button
          type="primary"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px"
          @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)"
        >
          Search
        </a-button>
        <a-button
          size="small"
          style="width: 90px"
          @click="() => handleReset(clearFilters)"
        >
          Reset
        </a-button>
      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
      <template slot="customRender" slot-scope="text, record, index, column">
        <span v-if="searchText && searchedColumn === column.dataIndex">
          <template
            v-for="(fragment, i) in text
              .toString()
              .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
          >
            <mark
              v-if="fragment.toLowerCase() === searchText.toLowerCase()"
              :key="i"
              class="highlight"
              >{{ fragment }}</mark
            >
            <template v-else>{{ fragment }}</template>
          </template>
        </span>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  data() {
    return {
      test: 'Marks',
      sorterInfo:  {},
      data: { clients: [], totalCount: 0 },
      pagination: {
        showSizeChanger: true,
        pageSize: 50,
        pageSizeOptions: ['50', '100', '200', '500'],
      },
      loading: false,
      searchText: '',
      searchInput: null,
      searchedColumn: '',
    columns:[
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          sortOrder: this.sorterInfo.columnKey === 'name' && this.sorterInfo.order,
          sorter: (a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
        },
        {
          title: 'Addresses',
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: "contacts",
          width:500
        },
        {
          title: 'Phone',
          dataIndex: 'phone',
          key: 'contacts[0].phone[0]',
        },
        {
          title: 'Created At',
          dataIndex: 'createdAt',
          key: 'createdAt',
        },
      ],
      
    };
  },
  props:['filterData'],
  apollo: {
    data: {
      query: gql`
        query Clients($skip: Float, $take: Float) {
          data(input: { skip: $skip, take: $take }) {
            clients {
              id
              name
              addresses {
                id
                streetName
                streetNumber
                officeNumber
              }
              contacts {
                phones
                emails
                name
                surname
              }
              createdAt
            }
            totalCount
          }
        }
      `,
      variables() {
        return {
          skip: this.pagination.pageSize * (this.pagination.current - 1),
          take: this.pagination.pageSize
        };
      },
      error(error) {
        this.$emit('error-occured', JSON.stringify(error));
        this.data = {clients:[], totalCount:0}
      },
      update: (queryRes) => {
        var clients = []
        // queryRes.data.clients.map(client => {
        //   let newClient = {};
        //   if(client.addresses && client.addresses.length>0){
        //     newClient.streetName = client.addresses[0].streetName;
        //     newClient.streetNumber = client.addresses[0].streetNumber;
        //     newClient.officeNumber = client.addresses[0].officeNumber;
        //   }
        //   if(client.contacts && client.contacts.length>0){
        //     newClient.name = client.contacts[0].name;
        //     newClient.surname = client.contacts[0].surname;
        //     if(client.contacts[0].phones && client.contacts[0].phones.length > 0){
        //       newClient.phone = client.contacts[0].phones[0];
        //     }
        //     if(client.contacts[0].emails && client.contacts[0].emails.length > 0){
        //       newClient.email = client.contacts[0].emails[0];
        //     }
        //   }
        //   return newClient;
        // });
        let prevClients = queryRes.data.clients;
        for (let i = 0; i < prevClients.length; i++) {
          let client = prevClients[i];
          if (client.addresses) {
            client.address = `${client.addresses[0].streetName} ${client.addresses[0].streetNumber}`;
          }
          clients.push(client);
          // for (let j = 0; j < client.addresses.length; j++) {
          //   let address = client.addresses[j];
          //   client.address = `${address.streetName} ${address.streetNumber}`;

          //   clients.push(JSON.parse(JSON.stringify(client)));
          // }
        }
        return {
          ...queryRes.data,
          clients,
        };
      },
    },
  },
  mounted() {
    this.sorterInfo = JSON.parse(localStorage.sorterInfo|| {}) ;
  },
  watch: {
    sorterInfo(newValue){
      localStorage.sorterInfo = JSON.stringify(newValue);
    },
    filterData(newValue){
      this.filterData = newValue;
      this.$apollo.queries.data.refetch().then(()=>{
        this.data.clients.forEach(client=>console.log(client))
        if(this.filterData.text && this.filterData.text.length){
          this.data.clients = this.data.clients.filter(client => 
            (
              client.name.includes(this.filterData.text) 
              || 
              (
                client.addresses.length>0 
                &&
                (
                  client.addresses[0].streetName.includes(this.filterData.text) 
                  ||   
                  client.addresses[0].streetNumber==this.filterData.text 
                  || 
                  client.addresses[0].officeNumber==this.filterData.text 
                )
              ) 
              ||
              (
                client.contacts.length>0 
                &&
                (
                  client.contacts[0].name.includes(this.filterData.text) 
                  || 
                  client.contacts[0].surname.includes(this.filterData.text) 
                  || 
                  client.contacts[0].phones[0].includes(this.filterData.text) 
                  || 
                  client.contacts[0].emails[0].includes(this.filterData.text) 
                )
              ) 
            ))
        }
      });
    }
  },
  methods: {
    onColumnFilter(value, record, column) {
      return record[column]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
    },
    handleSearch(selectedKeys, confirm, dataIndex) {
      confirm();
      this.searchText = selectedKeys[0];
      this.searchedColumn = dataIndex;
      console.log(this.filteredValues);
    },

    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },
    handleTableChange(pagination, filters, sorter) {
      this.pagination = {
        ...this.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      };
      this.sorterInfo = sorter || {};
      // this.fetch({
      //   results: pagination.pageSize,
      //   page: pagination.current,
      // });
    },
  },
};
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>
