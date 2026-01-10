import { STORAGE_KEYS } from "@/constants/config";
import { useScanHistoryStore } from "@/stores/scanHistoryStore";

jest.mock("@/services/storage/secureStorage", () => ({
  setSecureItem: jest.fn(),
  getSecureItem: jest.fn(),
  deleteSecureItem: jest.fn(),
}));

const secureStorage = jest.requireMock("@/services/storage/secureStorage") as {
  setSecureItem: jest.Mock;
  getSecureItem: jest.Mock;
  deleteSecureItem: jest.Mock;
};

describe("useScanHistoryStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useScanHistoryStore.setState({
      isHydrated: false,
      entries: [],
    });
  });

  it("hydrates entries from secure storage", async () => {
    const stored = [
      {
        id: "1",
        createdAt: 100,
        serviceName: "Service",
        outcome: "success",
      },
    ];

    secureStorage.getSecureItem.mockResolvedValue(JSON.stringify(stored));

    await useScanHistoryStore.getState().hydrate();

    expect(useScanHistoryStore.getState().isHydrated).toBe(true);
    expect(useScanHistoryStore.getState().entries).toHaveLength(1);
    expect(useScanHistoryStore.getState().entries[0]?.serviceName).toBe("Service");
  });

  it("adds an entry and persists", async () => {
    await useScanHistoryStore.getState().addEntry({
      serviceName: "S",
      outcome: "failure",
      detail: "QR_EXPIRED",
    });

    expect(useScanHistoryStore.getState().entries).toHaveLength(1);
    expect(secureStorage.setSecureItem).toHaveBeenCalledWith(
      STORAGE_KEYS.SCAN_HISTORY,
      expect.any(String)
    );
  });

  it("clears entries and deletes storage", async () => {
    useScanHistoryStore.setState({
      isHydrated: true,
      entries: [
        {
          id: "x",
          createdAt: Date.now(),
          serviceName: "S",
          outcome: "success",
        },
      ],
    });

    await useScanHistoryStore.getState().clear();

    expect(secureStorage.deleteSecureItem).toHaveBeenCalledWith(STORAGE_KEYS.SCAN_HISTORY);
    expect(useScanHistoryStore.getState().entries).toEqual([]);
  });
});

