<template>
  <div>
    <div v-if="error">{{ error }}</div>
    <a-table
      v-if="!error"
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
      data: { clients: [], totalCount: 0 },
      error: false,
      pagination: {
        showSizeChanger: true,
        pageSize: 50,
        pageSizeOptions: ['50', '100', '200', '500'],
      },
      loading: false,
      searchText: '',
      searchInput: null,
      searchedColumn: '',
      columns: [
        {
          title: 'Name',
          dataIndex: 'name',
          key: 'name',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
          sorter: (a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
          onFilter: (value, record) =>
            record.name
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase()),
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              }, 0);
            }
          },
        },
        {
          title: 'Addresses',
          dataIndex: 'address',
          key: 'address',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
          onFilter: (value, record) =>
            record.address
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase()),
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              }, 0);
            }
          },
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'contacts[0].email[0]',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
          onFilter: (value, record) =>
            this.onColumnFilter(value, record, 'email'),
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              });
            }
          },
        },
        {
          title: 'Phone',
          dataIndex: 'phone',
          key: 'contacts[0].phone[0]',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender',
          },
          onFilter: (value, record) => {
            return record.phone
              .toString()
              .toLowerCase()
              .includes(value.toLowerCase());
          },
          onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
              setTimeout(() => {
                this.searchInput.focus();
              });
            }
          },
        },
        {
          title: 'Created At',
          dataIndex: 'createdAt',
          key: 'createdAt',
        },
      ],
    };
  },
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
          take: this.pagination.pageSize,
        };
      },
      error(error) {
        this.error = JSON.stringify(error);
      },
      update: (queryRes) => {
        var clients = [];
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
  // mounted() {
  //   this.fetch();
  // },
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
    },

    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },
    handleTableChange(pagination) {
      console.log(
        pagination +
          '\n' +
          pagination.pageSize * (pagination.current - 1) +
          '\n' +
          pagination.pageSize
      );
      this.pagination = {
        ...this.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      };
      // this.fetch({
      //   results: pagination.pageSize,
      //   page: pagination.current,
      // });
    },
    fetch(params = {}) {
      console.log('params:', params);
      this.loading = true;
      // this.data = this.clients.data.clients;
      // this.pagination.total = this.clients.data.totalCount;
      // reqwest({
      //   url: 'https://randomuser.me/api',
      //   method: 'get',
      //   data: {
      //     results: 10,
      //     ...params,
      //   },
      //   type: 'json',
      // }).then((data) => {
      //   const pagination = { ...this.pagination };
      //   // Read total count from server
      //   // pagination.total = data.totalCount;
      //   pagination.total = 200;
      //   this.loading = false;
      //   this.data = data.results;
      //   this.pagination = pagination;
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
