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
      <template slot="nameAndAddress" slot-scope="record">
        <div>{{ record.company }}</div>
        <div>{{ `${record.streetName} ${record.streetNumber}` }}</div>
      </template>
      <template slot="email" slot-scope="text">
        <a :href="`mailto: ${text}`">{{ text }}</a>
      </template>
      <template slot="phone" slot-scope="text">
        <a :href="`tel: ${text}`">{{ text }}</a>
      </template>
      <template slot="createdAt" slot-scope="text">
        <span>{{ new Date(text).toLocaleDateString() }}</span>
      </template>
    </a-table>
  </div>
</template>

<script>
import gql from 'graphql-tag';

export default {
  data() {
    return {
      // order: false,
      data: { clients: [], totalCount: 0 },
      pagination: {
        showSizeChanger: true,
        pageSize: 50,
        pageSizeOptions: ['50', '100', '200', '500'],
      },
      loading: false,
      columns: [
        {
          title: 'Company Name',
          key: 'company',
          scopedSlots: {
            customRender: 'nameAndAddress',
          },
          // sortOrder: this.order,
          sorter: (a, b) =>
            a.company.toLowerCase().localeCompare(b.company.toLowerCase()),
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
          scopedSlots: {
            customRender: 'email',
          },
        },
        {
          title: 'Phone',
          dataIndex: 'phone',
          key: 'phone',
          scopedSlots: {
            customRender: 'phone',
          },
        },
        {
          title: 'Created At',
          dataIndex: 'createdAt',
          key: 'createdAt',
          scopedSlots: {
            customRender: 'createdAt',
          },
        },
      ],
    };
  },
  props: ['searchText'],
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
        this.$emit('error-occured', error.message);
        this.data = { clients: [], totalCount: 0 };
      },
      update: (queryRes) => {
        var clients = queryRes.data.clients.map((client) => {
          let newClient = {};
          newClient.id = client.id;
          newClient.company = client.name;
          newClient.createdAt = client.createdAt;
          if (client.addresses && client.addresses.length > 0) {
            newClient.streetName = client.addresses[0].streetName;
            newClient.streetNumber = client.addresses[0].streetNumber;
            newClient.officeNumber = client.addresses[0].officeNumber;
          }
          if (client.contacts && client.contacts.length > 0) {
            newClient.name = client.contacts[0].name;
            newClient.surname = client.contacts[0].surname;
            if (
              client.contacts[0].phones &&
              client.contacts[0].phones.length > 0
            ) {
              newClient.phone = client.contacts[0].phones[0];
            }
            if (
              client.contacts[0].emails &&
              client.contacts[0].emails.length > 0
            ) {
              newClient.email = client.contacts[0].emails[0];
            }
          }
          return newClient;
        });
        return {
          ...queryRes.data,
          clients,
        };
      },
    },
  },
  // mounted() {
  //   if (localStorage.order) {
  //     this.order = JSON.parse(localStorage.order);
  //   }
  // },
  watch: {
    // order(newValue) {
    //   localStorage.order = JSON.stringify(newValue);
    // },
    searchText(newValue) {
      let fieldsToCompare = [
        'company',
        'streetName',
        'streetNumber',
        'officeNumber',
        'name',
        'surname',
        'phone',
        'email',
      ];
      let searchKey = newValue.toString().toLowerCase();
      this.$apollo.queries.data.refetch().then(() => {
        if (searchKey.length) {
          this.data.clients = this.data.clients.filter((client) => {
            // returns false if any of client's properties doesn't match with searched text
            for (let i = 0; i < fieldsToCompare.length; i++) {
              let clientField = client[fieldsToCompare[i]]
                .toString()
                .toLowerCase();
              if (clientField.includes(searchKey)) {
                return true;
              }
            }
            return false;
          });
        }
      });
    },
  },
  methods: {
    handleTableChange(pagination) {
      this.pagination = {
        ...this.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      };
      // this.order = sorter.order || false;
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
