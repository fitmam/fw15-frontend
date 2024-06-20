"use client";
import MobileNav from "@/components/mobilenav";
import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import React, { useRef } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { FaPlus, FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import http from "@/helpers/http.helper";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setColor } from "@/redux/reducer/colorscheme";
import { toast } from "react-toastify";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import Loading from "@/components/loading";
import * as Yup from "yup";
import { getCookie } from "cookies-next";
import { useCallback } from "react";
import WithAuth from "@/components/isauth";

function Position() {
  const [open, setOpen] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [deletedData, setDeletedData] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [searchData, setSearchData] = useState("");
  const [businessTypeId, setPositionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [positionOfWorkContent, setPositionOfWorkContent] = useState([]);
  const [permissionsData, setPermissionsData] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  const user_id = useSelector((state) => state.user.user_id);

  const token = getCookie("token");

  const fetchUserById = useCallback(async () => {
    try {
      const { data } = await http(token).get(`/users/${user_id}`);
      setPermissionsData(data.results.permissions_allowed);
      setCurrentUser(data.results);
    } catch (err) {
      console.log(err);
    }
  }, [token, user_id]);

  useEffect(() => {
    fetchUserById();
  }, [fetchUserById]);

  const validatePosition = Yup.object({
    name: Yup.string().required("Harap diisi"),
  });

  const dispatch = useDispatch();

  const primary = useSelector((state) => state.color.color.primary);
  const secondary = useSelector((state) => state.color.color.secondary);
  const addPosition = useRef();

  async function fetchColor() {
    const { data } = await http().get("/color");
    return data.results;
  }

  async function fetchPositionById(id) {
    try {
      const { data } = await http(token).get(`/position-of-work/${id}`);
      setPositionOfWorkContent(data.results);
    } catch (err) {
      console.log(err);
    }
  }

  const { data: colorData } = useQuery({
    queryKey: ["color"],
    queryFn: () => fetchColor(),
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.style.setProperty("--primary-color", primary);
      document.documentElement.style.setProperty(
        "--secondary-color",
        secondary
      );
      dispatch(
        setColor({
          primary: colorData?.[0]?.primary,
          secondary: colorData?.[0]?.secondary,
          text: colorData?.[0]?.text,
        })
      );
    }
  }, [primary, secondary, colorData, dispatch]);

  const queryClient = useQueryClient();

  async function fetchPositionOfWork(
    pageData = page,
    search = searchData,
    limitData = limit
  ) {
    const { data } = await http(token).get(
      "/position-of-work?page=" +
        pageData +
        "&search=" +
        search +
        "&limit=" +
        limitData
    );
    return data.results;
  }

  const showUpdateModal = (itemId) => {
    const updatedId = itemId;
    setOpenEditModal(!openEditModal);
    setPositionId(updatedId);
  };

  const { data } = useQuery({
    queryKey: ["position-of-work", page, searchData, limit],
    queryFn: () => fetchPositionOfWork(page, searchData, limit),
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });

  const postPositionOfWork = useMutation({
    mutationFn: async (values) => {
      const logData = new URLSearchParams({
        user_name: currentUser.first_name,
        role_id: currentUser.role_id,
        crud_activites: "Tambah Jabatan",
      }).toString();
      await http(token).post("/user-log", logData);
      const data = new URLSearchParams(values).toString();
      return http(token).post("/position-of-work", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["position-of-work"] });
      setLoading(false);
      toast.success("Berhasil menambah jabatan");
    },
    onError: (err) => {
      setLoading(false);
      toast.error(err?.response?.data?.message);
    },
  });

  const updatePositionOfWork = useMutation({
    mutationFn: async (values) => {
      const logData = new URLSearchParams({
        user_name: currentUser.first_name,
        role_id: currentUser.role_id,
        crud_activites: "Update Jabatan",
      }).toString();
      await http(token).post("/user-log", logData);
      const data = new URLSearchParams(values).toString();
      return http(token).patch(`/position-of-work/${businessTypeId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["position-of-work"] });
      setLoading(false);
      toast.success("Berhasil mengupdate jabatan");
    },
    onError: (err) => {
      setLoading(false);
      toast.error(err?.response?.data?.message);
    },
  });

  const handleDelete = useMutation({
    mutationFn: async (id) => {
      const logData = new URLSearchParams({
        user_name: currentUser.first_name,
        role_id: currentUser.role_id,
        crud_activites: "Hapus Jabatan",
      }).toString();
      await http(token).post("/user-log", logData);
      return http(token).delete(`/position-of-work/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["position-of-work"] });
      toast.success("Berhasil menghapus jabatan");
      setLoading(false);
    },
    onError: (err) => {
      setLoading(false);
      toast.error(err?.response?.data?.message);
    },
  });

  return (
    <div className="flex w-full h-screen relative">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="w-full bg-[#edf0f0] p-8 flex gap-8 h-full overflow-y-scroll">
          <div className="w-full h-screen bg-white rounded-md overflow-auto">
            <div className="flex justify-between px-10 py-10 items-center w-full h-14">
              <div className="flex items-center gap-2">
                <BsPeopleFill size={25} color="#36404c" />
                Data Jabatan
              </div>
              <div>
                {permissionsData?.position_create && (
                  <button
                    onClick={() => {
                      setOpenAddModal(!openAddModal);
                      addPosition.current?.resetForm();
                    }}
                    className="bg-primary cursor-pointer text-white p-2.5 rounded-md text-xs flex justify-center items-center gap-2"
                  >
                    <FaPlus />
                    Tambah Jabatan
                  </button>
                )}
              </div>
            </div>
            <div className="flex px-10 w-full h-12 justify-between flex-col md:flex-row gap-2 md:gap-0">
              <div className="flex gap-3">
                Show
                <select
                  className="border w-14 h-6 rounded-md"
                  onChange={(event) => {
                    setLimit(parseInt(event.target.value));
                    fetchPositionOfWork();
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
                Entries
              </div>
              <div>
                Search :
                <input
                  type="text"
                  className="border border-gray-300 rounded-md ml-3 focus:outline-none px-2"
                  onChange={(event) => {
                    setSearchData(event.target.value);
                    fetchPositionOfWork();
                  }}
                ></input>
              </div>
            </div>
            <div className="px-10 py-10 max-w-xs md:max-w-none md:overflow-visible overflow-x-auto">
              <table className="w-full">
                <tr className="h-16 bg-[#E0F4FF]">
                  <th className="text-xs w-12">No</th>
                  <th className="text-xs w-48">Posisi</th>
                  {(permissionsData?.position_update ||
                    permissionsData?.position_delete) && (
                    <th className="text-xs w-12">Aksi</th>
                  )}
                </tr>
                {permissionsData?.position_read &&
                  data?.data?.map((item, index) => {
                    const isOddRow = index % 2 !== 0;
                    return (
                      <tr
                        className={`h-12 text-center hover:bg-[#F3F3F3] cursor-pointer ${
                          isOddRow ? "bg-[#F3F3F3]" : ""
                        }`}
                        key={item.id}
                      >
                        <td className="text-xs pl-3 text-center">
                          {index + 1}
                        </td>
                        <td className="pl-4 text-xs text-center">
                          {item.name}
                        </td>
                        <td className="m-auto">
                          <div className="flex gap-3 justify-center items-center">
                            {permissionsData?.position_update && (
                              <button
                                onClick={() => {
                                  showUpdateModal(item.id);
                                  fetchPositionById(item.id);
                                }}
                                type="button"
                                className="cursor-pointer text-xs bg-orange-500 text-white rounded-md p-1 flex items-center gap-2"
                              >
                                <FaPencil size={10} />
                                Edit
                              </button>
                            )}
                            {permissionsData?.position_delete && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpen(!open);
                                  setDeletedData(item.id);
                                }}
                                className="cursor-pointer text-xs bg-red-500 text-white rounded-md p-1 flex items-center gap-2"
                              >
                                <FaTrash size={10} />
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </table>
              {data?.data?.length === 0 && (
                <div className="w-full pt-5 text-xl flex justify-center items-center">
                  <div>No data found</div>
                </div>
              )}
            </div>
            <div className="w-full flex justify-between py-20 px-10">
              <div className="text-sm">
                Show {data?.currentPage} of {data?.totalPages} entries
              </div>
              <div className="flex">
                <button
                  onClick={() => setPage((prev) => prev - 1)}
                  disabled={data?.currentPage <= 1}
                  className="border px-2 py-2 text-sm disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
                >
                  Previous
                </button>
                <button
                  className="border px-2 py-2 text-sm disabled:cursor-not-allowed disabled:bg-white disabled:text-black"
                  disabled={data?.currentPage === data?.totalPages}
                  onClick={() => {
                    setPage((old) => old + 1);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
      <input
        type="checkbox"
        id="addModal"
        className="modal-toggle"
        checked={openAddModal}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg pb-5">Tambah Jabatan</h3>
          <Formik
            initialValues={{
              name: "",
            }}
            validationSchema={validatePosition}
            onSubmit={(values) => {
              setOpenAddModal(!openAddModal);
              postPositionOfWork.mutate(values);
              setLoading(true);
            }}
            innerRef={addPosition}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-5 pb-3">
                    <div>
                      <div className="text-sm pb-2">Nama :</div>
                      <input
                        type="text"
                        name="name"
                        className="w-full h-10 border focus:outline-none rounded-md px-4"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      ></input>
                      {errors.name && touched.name && (
                        <div className="text-sm pt-1 text-red-500">
                          {errors.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full pt-5 flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => setOpenAddModal(!openAddModal)}
                      className="bg-red-500 text-white p-2 rounded-md cursor-pointer w-24"
                    >
                      Tutup
                    </button>
                    <button
                      type="submit"
                      className="bg-green-500 text-white p-2 rounded-md cursor-pointer w-24"
                    >
                      Tambah
                    </button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="addModal"
          onClick={() => {
            setOpenAddModal(!openAddModal);
          }}
        >
          Close
        </label>
      </div>
      <input
        type="checkbox"
        id="editModal"
        className="modal-toggle"
        checked={openEditModal}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg pb-5">Edit Jabatan</h3>
          <Formik
            initialValues={{
              name: positionOfWorkContent.name,
            }}
            validationSchema={validatePosition}
            enableReinitialize={true}
            onSubmit={(values) => {
              setOpenEditModal(!openEditModal);
              updatePositionOfWork.mutate(values);
              setLoading(true);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => {
              return (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-5 pb-3">
                    <div>
                      <div className="text-sm pb-2">Nama :</div>
                      <input
                        type="text"
                        name="name"
                        className="w-full h-10 border focus:outline-none rounded-md px-4"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      ></input>
                      {errors.name && touched.name && (
                        <div className="text-sm pt-1 text-red-500">
                          {errors.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full pt-5 flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => setOpenEditModal(!openEditModal)}
                      className="bg-red-500 text-white p-2 rounded-md cursor-pointer w-24"
                    >
                      Tutup
                    </button>
                    <button
                      type="submit"
                      className="bg-green-500 text-white p-2 rounded-md cursor-pointer w-24"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="addModal"
          onClick={() => {
            setOpenEditModal(!openEditModal);
          }}
        >
          Close
        </label>
      </div>
      <input
        type="checkbox"
        id="deleteModal"
        className="modal-toggle"
        checked={open}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg pb-5">Hapus Jabatan</h3>
          <h3 className="font-bold text-lg pb-5">
            Apakah anda yakin ingin menghapusnya ?
          </h3>
          <div className="w-full pt-5 flex gap-4 justify-end">
            <button
              onClick={() => {
                setOpen(!open);
              }}
              type="button"
              className="bg-red-500 text-white p-2 rounded-md cursor-pointer w-24"
            >
              Tidak
            </button>
            <button
              onClick={() => {
                setOpen(!open);
                setLoading(true);
                handleDelete.mutate(deletedData);
              }}
              type="button"
              className="bg-green-500 text-white p-2 rounded-md cursor-pointer w-24"
            >
              Ya
            </button>
          </div>
        </div>
        <label
          className="modal-backdrop"
          htmlFor="addModal"
          onClick={() => {
            setOpen(!open);
          }}
        >
          Close
        </label>
      </div>
      {loading && <Loading />}
    </div>
  );
}

export default WithAuth(Position);
