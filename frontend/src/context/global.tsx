import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

const GlobalContext = createContext<IGlobalContext>({
  user: null,
  signup: async () => false,
  login: async () => false,
  subscribe: async () => false,
  updateSubscription: async () => false,
  payment: async () => false,
});

const sleep = (time: number) =>
  new Promise((res) => setTimeout(() => res(true), time));

const GlobalContextWrapper: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<IGlobalContext["user"]>(null);
  const [token, setToken] = useLocalStorage<string | null>("token", null);

  const me = () =>
    instance
      .get<IGlobalContext["user"]>("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => res.data)
      .catch(() => null);

  useEffect(() => {
    me().then(setUser);
  }, []);

  function loginUser(email: string, password: string) {
    return instance
      .post("/auth/signin", { email, password })
      .then((res) => setToken(res.data))
      .then(() => sleep(1000))
      .then(me)
      .then(setUser)
      .then(() => true)
      .catch(() => false);
  }

  function signUpUser(payload: RegisterUser) {
    return instance
      .post("/auth/signup", payload)
      .then((res) => setToken(res.data))
      .then(() => sleep(1000))
      .then(me)
      .then(setUser)
      .then(() => true)
      .catch(() => false);
  }

  function subscribeBatch(batch: Batch) {
    return instance
      .post(
        "/users/me/subscribe",
        { batch },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(me)
      .then(setUser)
      .then(() => true)
      .catch(() => false);
  }

  function updateSubscription(batch: Batch) {
    return instance
      .patch(
        "/users/me/subscribe",
        { batch },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(me)
      .then(setUser)
      .then(() => true)
      .catch(() => false);
  }

  function payment(mode: string) {
    return instance
      .post(
        "/users/me/payment",
        { mode },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(me)
      .then(setUser)
      .then(() => true)
      .catch(() => false);
  }

  return (
    <GlobalContext.Provider
      value={{
        user,
        signup: signUpUser,
        login: loginUser,
        subscribe: subscribeBatch,
        updateSubscription,
        payment,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContextWrapper;

export const useGlobalContext = () => useContext(GlobalContext);

/** Types */

interface IGlobalContext {
  user:
    | (User & {
        subscription: Subscription | null;
      })
    | null;

  signup: (user: RegisterUser) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  subscribe: (batch: Batch) => Promise<boolean>;
  updateSubscription: (batch: Batch) => Promise<boolean>;
  payment: (mode: string) => Promise<boolean>;
}

export const Batch = {
  SIX_TO_SEVEN: "SIX_TO_SEVEN",
  SEVEN_TO_EIGHT: "SEVEN_TO_EIGHT",
  EIGHT_TO_NINE: "EIGHT_TO_NINE",
  FIVE_TO_SIX: "FIVE_TO_SIX",
} as const;

export const BatcMapping = {
  SIX_TO_SEVEN: "6 am - 7 am",
  SEVEN_TO_EIGHT: "7 am - 8 am",
  EIGHT_TO_NINE: "8 am - 9 am",
  FIVE_TO_SIX: "5 pm - 6 pm",
};
export type Batch = typeof Batch[keyof typeof Batch];

export type RegisterUser = Pick<User, "email" | "age" | "name" | "weight"> & {
  password: string;
};

export type User = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
  passwordHash: string;
  age: number;
  weight: number;
};

export type Subscription = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  batch: Batch;
  lastPaymentDate: Date | null;
  userId: number;
};
