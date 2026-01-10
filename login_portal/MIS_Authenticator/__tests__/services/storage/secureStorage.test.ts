import * as SecureStore from "expo-secure-store";
import { deleteSecureItem, getSecureItem, setSecureItem } from "@/services/storage/secureStorage";

describe("secureStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets an item", async () => {
    await setSecureItem("k", "v");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("k", "v");
  });

  it("gets an item", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("value");
    await expect(getSecureItem("k")).resolves.toBe("value");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("k");
  });

  it("deletes an item", async () => {
    await deleteSecureItem("k");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("k");
  });
});

