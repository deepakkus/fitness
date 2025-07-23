/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Error from "next/error";

export default function NotFound() {
  return <Error statusCode={404} />;
}
