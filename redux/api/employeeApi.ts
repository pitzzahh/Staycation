import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const employeeApi = createApi({
    reducerPath: "employeeApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api"}),
    tagTypes: ['Employee'],
    endpoints: (builder) => ({
        getEmployees: builder.query({
            query(params) {
                return {
                    url: "/admin/employees",
                    params
                };
            },
            providesTags: ['Employee']
        }),

        //Create employee
        createEmployee: builder.mutation({
            query(body) {
                return {
                    url: "/admin/employees",
                    method: "POST",
                    body
                }
            },
            invalidatesTags: ['Employee']
        }),

        loginEmployee: builder.mutation({
            query(body) {
                return {
                    url: "/admin/login",
                    method: "POST",
                    body
                }
            }
        })
    })
});

export const {
    useCreateEmployeeMutation,
    useGetEmployeesQuery,
    useLoginEmployeeMutation
} = employeeApi